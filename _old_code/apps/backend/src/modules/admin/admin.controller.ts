import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetReportDto, CompareMonthDto } from './dto/get-report.dto';
import { ReplyFeedbackDto } from './dto/reply-feedback.dto';
import {
  UpdateUserPlanDto,
  GetUsersQueryDto,
  SubmitFeedbackDto,
} from './dto/Admin user.dto';

// ── Guard dùng chung cho toàn bộ Admin routes ──────────────────
const AdminGuards = [JwtAuthGuard, RolesGuard];

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/dashboard
   * Tổng quan: số user, doanh thu, feedback chờ xử lý...
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ════════════════════════════════════════════════════════════
  // QUẢN LÝ NGƯỜI DÙNG
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/users?plan=PREMIUM&search=nguyen&page=1&limit=20
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/users')
  getUsers(@Query() query: GetUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  /**
   * PATCH /admin/users/:id/plan
   * Admin cập nhật gói của user (có thể tặng hoặc hạ xuống FREE)
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Patch('admin/users/:id/plan')
  updateUserPlan(@Param('id') id: string, @Body() body: UpdateUserPlanDto) {
    return this.adminService.updateUserPlan(id, body.plan);
  }

  // ════════════════════════════════════════════════════════════
  // BÁO CÁO NGƯỜI DÙNG MỚI
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/reports/users?from=2026-01-01&to=2026-03-31&groupBy=day
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/reports/users')
  getNewUsersReport(@Query() query: GetReportDto) {
    return this.adminService.getNewUsersReport(query);
  }

  // ════════════════════════════════════════════════════════════
  // BÁO CÁO DOANH THU
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/reports/revenue?from=2026-01-01&to=2026-03-31&groupBy=month
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/reports/revenue')
  getRevenueReport(@Query() query: GetReportDto) {
    return this.adminService.getRevenueReport(query);
  }

  // ════════════════════════════════════════════════════════════
  // SO SÁNH 2 THÁNG
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/reports/compare?month1=2026-01-01&month2=2026-02-01
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/reports/compare')
  compareMonths(@Query() query: CompareMonthDto) {
    return this.adminService.compareMonths(query.month1, query.month2);
  }

  // ════════════════════════════════════════════════════════════
  // XUẤT FILE BÁO CÁO CSV
  // ════════════════════════════════════════════════════════════

  /**
   * GET /admin/export/revenue?from=2026-01-01&to=2026-03-31
   * Trả về file CSV doanh thu để admin tải về
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/export/revenue')
  async exportRevenueCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.adminService.exportRevenueReportCsv(from, to);
    const filename = `revenue_${from}_to_${to}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM để Excel mở file UTF-8 không bị lỗi tiếng Việt
    res.send('\uFEFF' + csv);
  }

  /**
   * GET /admin/export/users?from=2026-01-01&to=2026-03-31
   * Trả về file CSV danh sách user mới đăng ký
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/export/users')
  async exportUsersCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.adminService.exportUsersReportCsv(from, to);
    const filename = `users_${from}_to_${to}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  }

  // ════════════════════════════════════════════════════════════
  // FEEDBACK
  // ════════════════════════════════════════════════════════════

  /**
   * POST /feedback
   * Người dùng thường gửi feedback (chỉ cần đăng nhập, không cần ADMIN)
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('feedback')
  submitFeedback(@Req() req: any, @Body() body: SubmitFeedbackDto) {
    return this.adminService.submitFeedback(req.user.userId, body);
  }

  /**
   * GET /admin/feedbacks?status=PENDING&page=1
   * Admin xem danh sách feedback
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @Get('admin/feedbacks')
  getFeedbacks(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.adminService.getFeedbacks(status, +page, +limit);
  }

  /**
   * POST /admin/feedbacks/:id/reply
   * Admin trả lời feedback của user
   */
  @UseGuards(...AdminGuards)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('admin/feedbacks/:id/reply')
  replyFeedback(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: ReplyFeedbackDto,
  ) {
    return this.adminService.replyFeedback(id, req.user.userId, body.reply);
  }

  /**
   * GET /feedback
   * Người dùng xem lại lịch sử các phản hồi của chính mình
   */
  @UseGuards(JwtAuthGuard)
  @Get('feedback')
  getUserFeedbacks(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // Lấy userId từ token đăng nhập để tìm đúng phản hồi của người đó
    return this.adminService.getUserFeedbacks(req.user.userId, +page, +limit);
  }
}
