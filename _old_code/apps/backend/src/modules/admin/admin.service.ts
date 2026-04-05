import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, PipelineStage } from 'mongoose';
import { Types } from 'mongoose';
import {
  User,
  UserDocument,
  Feedback,
  FeedbackDocument,
  Payment,
  PaymentDocument,
  ScanHistory,
  ScanHistoryDocument,
} from '@agri-scan/database';
import { GetReportDto, GroupBy } from './dto/get-report.dto';
import { GetUsersQueryDto } from './dto/Admin user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(ScanHistory.name)
    private scanHistoryModel: Model<ScanHistoryDocument>,
  ) {}

  // ════════════════════════════════════════════════════════════
  // 1. DASHBOARD OVERVIEW
  // ════════════════════════════════════════════════════════════
  async getDashboard() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0); // Mutate bản copy, không mutate now
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      totalPremium,
      totalVip,
      totalFree,
      pendingFeedbacks,
      totalRevenue,
      revenueThisMonth,
      totalScans,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: { $ne: 'ADMIN' } }),
      this.userModel.countDocuments({
        role: { $ne: 'ADMIN' },
        createdAt: { $gte: todayStart },
      }),
      this.userModel.countDocuments({
        role: { $ne: 'ADMIN' },
        createdAt: { $gte: monthStart },
      }),
      this.userModel.countDocuments({ plan: 'PREMIUM' }),
      this.userModel.countDocuments({ plan: 'VIP' }),
      this.userModel.countDocuments({ plan: 'FREE', role: { $ne: 'ADMIN' } }),
      this.feedbackModel.countDocuments({ status: 'PENDING' }),
      this.paymentModel.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.scanHistoryModel.countDocuments(),
    ]);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
        byPlan: { FREE: totalFree, PREMIUM: totalPremium, VIP: totalVip },
      },
      revenue: {
        total: totalRevenue[0]?.total ?? 0,
        thisMonth: revenueThisMonth[0]?.total ?? 0,
      },
      pendingFeedbacks,
      totalScans,
    };
  }

  // ════════════════════════════════════════════════════════════
  // 2. QUẢN LÝ NGƯỜI DÙNG
  // ════════════════════════════════════════════════════════════
  async getUsers(query: GetUsersQueryDto) {
    const { plan, role, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { role: { $ne: 'ADMIN' } };

    if (plan) filter.plan = plan;
    if (role && role !== 'ADMIN') filter.role = role;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -googleId -facebookId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserPlan(
    userId: string,
    plan: 'FREE' | 'PREMIUM' | 'VIP',
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Người dùng không tồn tại!');
    if (user.role === 'ADMIN')
      throw new BadRequestException('Không thể thay đổi gói của Admin!');

    user.plan = plan;

    if (plan === 'FREE') {
      user.planExpiresAt = null;
    } else {
      const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.planExpiresAt = expirationDate;

      // Ghi nhận payment khi admin gán gói thủ công (miễn phí / tặng)
      await this.paymentModel.create({
        userId: user._id,
        plan,
        amount: 0, // admin tặng → 0 đồng
        status: 'SUCCESS',
        method: 'ADMIN_GRANT',
      });
    }

    return user.save();
  }

  // ════════════════════════════════════════════════════════════
  // 3. BÁO CÁO NGƯỜI DÙNG MỚI
  // ════════════════════════════════════════════════════════════
  async getNewUsersReport(dto: GetReportDto) {
    const { from, to, groupBy = GroupBy.DAY } = dto;
    const pipeline = this._buildTimeSeriesPipeline(
      this.userModel,
      from,
      to,
      groupBy,
      { role: { $ne: 'ADMIN' } },
    );

    const result = await this.userModel.aggregate(pipeline);
    return this._fillMissingDates(result, from, to, groupBy);
  }

  // ════════════════════════════════════════════════════════════
  // 4. BÁO CÁO DOANH THU
  // ════════════════════════════════════════════════════════════
  async getRevenueReport(dto: GetReportDto) {
    const { from, to, groupBy = GroupBy.DAY } = dto;

    const groupFormat = groupBy === GroupBy.MONTH ? '%Y-%m' : '%Y-%m-%d';

    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: 'SUCCESS',
          createdAt: {
            $gte: new Date(from),
            $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: groupFormat, date: '$createdAt' },
            },
            plan: '$plan',
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          totalRevenue: { $sum: '$revenue' },
          totalTransactions: { $sum: '$count' },
          byPlan: {
            $push: {
              plan: '$_id.plan',
              revenue: '$revenue',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await this.paymentModel.aggregate(pipeline);

    // Tính tổng cộng
    const summary = result.reduce(
      (acc, item) => {
        acc.totalRevenue += item.totalRevenue;
        acc.totalTransactions += item.totalTransactions;
        return acc;
      },
      { totalRevenue: 0, totalTransactions: 0 },
    );

    return { summary, data: result };
  }

  // ════════════════════════════════════════════════════════════
  // 5. SO SÁNH 2 THÁNG
  // ════════════════════════════════════════════════════════════
  async compareMonths(month1: string, month2: string) {
    const getMonthRange = (dateStr: string) => {
      const d = new Date(dateStr);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      return { start, end };
    };

    const m1 = getMonthRange(month1);
    const m2 = getMonthRange(month2);

    const fetchMonthStats = async (start: Date, end: Date) => {
      const [newUsers, revenue, scans, premiumUsers, vipUsers] =
        await Promise.all([
          this.userModel.countDocuments({
            role: { $ne: 'ADMIN' },
            createdAt: { $gte: start, $lte: end },
          }),
          this.paymentModel.aggregate([
            {
              $match: {
                status: 'SUCCESS',
                createdAt: { $gte: start, $lte: end },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ]),
          this.scanHistoryModel.countDocuments({
            createdAt: { $gte: start, $lte: end },
          }),
          this.userModel.countDocuments({
            plan: 'PREMIUM',
            createdAt: { $gte: start, $lte: end },
          }),
          this.userModel.countDocuments({
            plan: 'VIP',
            createdAt: { $gte: start, $lte: end },
          }),
        ]);

      return {
        period: `${start.toISOString().substring(0, 7)}`,
        newUsers,
        revenue: revenue[0]?.total ?? 0,
        transactions: revenue[0]?.count ?? 0,
        scans,
        newPremiumUsers: premiumUsers,
        newVipUsers: vipUsers,
      };
    };

    const [stats1, stats2] = await Promise.all([
      fetchMonthStats(m1.start, m1.end),
      fetchMonthStats(m2.start, m2.end),
    ]);

    // Tính % thay đổi
    const calcChange = (v1: number, v2: number) => {
      if (v1 === 0) return v2 === 0 ? 0 : 100;
      return Number((((v2 - v1) / v1) * 100).toFixed(2));
    };

    return {
      month1: stats1,
      month2: stats2,
      changes: {
        newUsers: calcChange(stats1.newUsers, stats2.newUsers),
        revenue: calcChange(stats1.revenue, stats2.revenue),
        scans: calcChange(stats1.scans, stats2.scans),
        transactions: calcChange(stats1.transactions, stats2.transactions),
      },
    };
  }

  // ════════════════════════════════════════════════════════════
  // 6. QUẢN LÝ FEEDBACK
  // ════════════════════════════════════════════════════════════
  async submitFeedback(
    userId: string,
    data: { category: string; content: string },
  ) {
    const feedback = await this.feedbackModel.create({
      userId: new Types.ObjectId(userId),
      ...data,
    });
    return { message: 'Cảm ơn bạn đã gửi phản hồi!', id: feedback._id };
  }

  async getFeedbacks(status?: string, page = 1, limit = 20) {
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.feedbackModel
        .find(filter)
        .populate('userId', 'email fullName')
        .populate('repliedBy', 'email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.feedbackModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async replyFeedback(feedbackId: string, adminId: string, reply: string) {
    const feedback = await this.feedbackModel.findById(feedbackId);
    if (!feedback) throw new NotFoundException('Không tìm thấy feedback này!');
    if (feedback.status === 'REPLIED') {
      throw new BadRequestException('Feedback này đã được trả lời!');
    }

    feedback.adminReply = reply;
    feedback.repliedBy = new Types.ObjectId(adminId) as any;
    feedback.repliedAt = new Date();
    feedback.status = 'REPLIED';

    await feedback.save();
    return { message: 'Đã trả lời feedback thành công!' };
  }

  // ════════════════════════════════════════════════════════════
  // 7. XUẤT BÁO CÁO CSV
  // ════════════════════════════════════════════════════════════
  async exportRevenueReportCsv(from: string, to: string): Promise<string> {
    const { data } = await this.getRevenueReport({
      from,
      to,
      groupBy: GroupBy.DAY,
    });

    const rows = [
      ['Ngày', 'Tổng doanh thu (VND)', 'Số giao dịch', 'PREMIUM', 'VIP'],
    ];

    for (const item of data) {
      const premiumRow = item.byPlan.find((p: any) => p.plan === 'PREMIUM');
      const vipRow = item.byPlan.find((p: any) => p.plan === 'VIP');
      rows.push([
        item._id,
        item.totalRevenue,
        item.totalTransactions,
        premiumRow?.revenue ?? 0,
        vipRow?.revenue ?? 0,
      ]);
    }

    return rows.map((row) => row.join(',')).join('\n');
  }

  async exportUsersReportCsv(from: string, to: string): Promise<string> {
    const users = await this.userModel
      .find({
        role: { $ne: 'ADMIN' },
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
        },
      })
      .select('email fullName plan createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const rows = [['Email', 'Họ tên', 'Gói', 'Ngày đăng ký']];
    for (const u of users) {
      rows.push([
        u.email,
        u.fullName,
        u.plan,
        new Date((u as any).createdAt).toLocaleDateString('vi-VN'),
      ]);
    }

    return rows.map((row) => row.join(',')).join('\n');
  }

  // ════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ════════════════════════════════════════════════════════════
  private _buildTimeSeriesPipeline(
    _model: any,
    from: string,
    to: string,
    groupBy: GroupBy,
    extraMatch: Record<string, any> = {},
  ): PipelineStage[] {
    const groupFormat = groupBy === GroupBy.MONTH ? '%Y-%m' : '%Y-%m-%d';

    return [
      {
        $match: {
          ...extraMatch,
          createdAt: {
            $gte: new Date(from),
            $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } },
    ];
  }

  // Điền 0 vào các ngày/tháng không có data để biểu đồ frontend không bị lỗ
  private _fillMissingDates(
    data: { date: string; count: number }[],
    from: string,
    to: string,
    groupBy: GroupBy,
  ) {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const result: { date: string; count: number }[] = [];

    const cursor = new Date(from);
    const end = new Date(to);

    while (cursor <= end) {
      const key =
        groupBy === GroupBy.MONTH
          ? cursor.toISOString().substring(0, 7)
          : cursor.toISOString().substring(0, 10);

      result.push({ date: key, count: map.get(key) ?? 0 });

      if (groupBy === GroupBy.MONTH) {
        cursor.setMonth(cursor.getMonth() + 1);
      } else {
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return result;
  }
  // Thêm hàm này để lấy danh sách feedback của riêng 1 User
  async getUserFeedbacks(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { userId: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      this.feedbackModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.feedbackModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
