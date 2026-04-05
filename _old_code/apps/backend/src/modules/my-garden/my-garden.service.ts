import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MyGarden, MyGardenDocument, User } from '@agri-scan/database'; // BỎ import Plant
import { WeatherService } from '../weather/Weather.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MyGardenService {
  private readonly logger = new Logger(MyGardenService.name);
  private readonly PLAN_LIMITS = { FREE: 0, PREMIUM: 10, VIP: 20 };

  constructor(
    @InjectModel(MyGarden.name) private myGardenModel: Model<MyGardenDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly weatherService: WeatherService,
    private readonly configService: ConfigService,
  ) { }

  private get aiServiceUrl(): string {
    return this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async getUserGarden(userId: string) {
    // Không còn populate 'plantId' nữa
    return this.myGardenModel
      .find({ userId: new Types.ObjectId(userId), status: { $ne: 'FAILED' } })
      .sort({ lastInteractionDate: -1 })
      .lean()
      .exec();
  }

  private async validateUserPlan(userId: string) {
    // ... Giữ nguyên logic cũ của bạn ở đây ...
    const user = await this.userModel.findById(userId);
    if (!user) throw new ForbiddenException('Không tìm thấy người dùng.');

    const today = new Date();
    if (user.plan !== 'FREE' && user.planExpiresAt && user.planExpiresAt < today) {
      user.plan = 'FREE';
      user.planExpiresAt = null;
      await user.save();
    }

    const maxPlants = this.PLAN_LIMITS[user.plan as keyof typeof this.PLAN_LIMITS] ?? 0;
    if (maxPlants === 0) {
      throw new ForbiddenException('Tính năng My Garden chỉ dành cho Premium/VIP.');
    }

    const currentPlantCount = await this.myGardenModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: { $in: ['IN_PROGRESS', 'COMPLETED'] },
    });

    return { user, maxPlants, currentPlantCount };
  }

  async addPlantToGarden(dto: {
    userId: string;
    plantName: string;       // BUG 3 FIX: tách riêng từ ViT output
    diseaseName: string;     // BUG 3 FIX: "Khỏe mạnh" hoặc tên bệnh
    imageUrl?: string;
    customName?: string;
    userGoal: string;
    lat: number;
    lon: number;
  }) {
    // 1. Kiểm tra plan
    const { user, maxPlants, currentPlantCount } = await this.validateUserPlan(dto.userId);
    if (currentPlantCount >= maxPlants) {
      throw new BadRequestException(`Gói ${user.plan} chỉ cho trồng tối đa ${maxPlants} cây.`);
    }

    // 2. Lấy thời tiết cơ bản để truyền cho AI
    let weatherForecastStr = '';
    try {
      const weatherData = await this.weatherService.getWeatherAndAdvice(dto.lat, dto.lon, 'ALL');
      const dailySummaries = weatherData.weatherData.daily.slice(0, 7).map(
        (day, idx) => `Ngày ${idx + 1}: ${day.summary}, ${day.tempMin}-${day.tempMax}°C`
      );
      weatherForecastStr = dailySummaries.join(' | ');
    } catch {
      weatherForecastStr = 'Không có dữ liệu thời tiết.';
    }

    // BUG 2 FIX: isHealthy phải dựa trên diseaseName từ ViT, KHÔNG phải aiData.scientificName
    // aiData là response của /plant_garden (lộ trình), nó không bao giờ có scientificName
    const isHealthy = dto.diseaseName === 'Khỏe mạnh';
    const currentCondition = isHealthy ? 'Khỏe mạnh' : `Đang điều trị: ${dto.diseaseName}`;

    // BUG 4 FIX: Gửi payload có cấu trúc rõ ràng thay vì gộp hết vào 1 string "prompt"
    // Python llm.py sẽ đọc các field này để build system_prompt đúng
    let aiData;
    try {
      const aiPayload = {
        plant_name: dto.plantName,
        disease_name: dto.diseaseName,       // "Khỏe mạnh" hoặc tên bệnh
        user_goal: dto.userGoal,              // "HEAL_DISEASE", "GET_FRUIT", "GENERAL_CARE"
        weather_forecast: weatherForecastStr, // Chuỗi tóm tắt 7 ngày
      };
      const resp = await axios.post(`${this.aiServiceUrl}/plant_garden`, aiPayload);
      aiData = resp.data;
    } catch (error) {
      throw new InternalServerErrorException('AI đang bận hoặc không thể phân tích cây này.');
    }

    // BUG 2 FIX: plantInfo không lấy từ /plant_garden nữa
    // /plant_garden chỉ trả lộ trình (roadmap_summary, daily_tasks...)
    // không bao giờ có scientificName, commonName... trong response đó

    // 4. Lưu vào MongoDB
    const newGardenPlant = new this.myGardenModel({
      userId: new Types.ObjectId(dto.userId),
      aiLabel: dto.plantName,           // BUG 3 FIX: dùng plantName thay dto.label
      imageUrl: dto.imageUrl || '',
      customName: dto.customName || dto.plantName,  // BUG 3 FIX
      userGoal: dto.userGoal,
      currentCondition: currentCondition,
      roadmapSummary: aiData.roadmap_summary || '',
      growthStages: aiData.growth_stages || ['Giai đoạn 1', 'Giai đoạn 2', 'Giai đoạn 3'],
      currentStageIndex: aiData.current_stage_index ?? 0,
      progressPercentage: 0,
      lastInteractionDate: new Date(),
      // BUG 5 FIX: optional chaining để tránh crash khi AI trả về thiếu field
      careRoadmap: (aiData.daily_tasks ?? []).map(task => ({
        ...task,
        date: new Date(new Date().getTime() + (task.day - 1) * 24 * 60 * 60 * 1000),
        isCompleted: false
      })),
    });

    // BUG 1 FIX: Phải .save() trước, KHÔNG gọi .populate('plantId') vì schema không còn dùng plantId
    // (Comment trong service đã ghi "BỎ import Plant" nhưng code vẫn còn dòng populate)
    await newGardenPlant.save();

    return { message: 'Thêm cây thành công!', data: newGardenPlant };
  }

  // ==========================================
  // 3. CHECK-IN HẰNG NGÀY & XỬ LÝ "BỎ BÊ 3 NGÀY"
  // ==========================================
  async dailyCheckIn(
    gardenId: string,
    userId: string,
    currentDay: number,
    imageUrl: string,  // BUG 6 FIX: bắt buộc có ảnh để AI phân tích tình trạng ngày hôm nay
    lat: number,
    lon: number,
  ) {
    await this.validateUserPlan(userId);

    const gardenPlant = await this.myGardenModel.findOne({
      _id: gardenId,
      userId: new Types.ObjectId(userId),
    });
    if (!gardenPlant) throw new NotFoundException('Không tìm thấy cây trong vườn.');

    const today = new Date();
    const lastInteraction = new Date(gardenPlant.lastInteractionDate);
    const diffDays = Math.ceil(
      Math.abs(today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 3) {
      return {
        requireRegeneration: true,
        message: 'Bạn đã không cập nhật tình trạng cây quá 3 ngày. Vui lòng chụp ảnh mới để AI đánh giá lại từ đầu.',
      };
    }

    // BUG 6 FIX: Gọi AI để phân tích ảnh ngày hôm nay + thời tiết → cập nhật lại lộ trình
    let updatedRoadmap = gardenPlant.careRoadmap;
    try {
      // Lấy thời tiết hôm nay
      let weatherToday = 'Không có dữ liệu thời tiết.';
      try {
        const weatherData = await this.weatherService.getWeatherAndAdvice(lat, lon, 'ALL');
        const todayWeather = weatherData.weatherData.daily[0];
        if (todayWeather) {
          weatherToday = `${todayWeather.summary}, ${todayWeather.tempMin}-${todayWeather.tempMax}°C`;
        }
      } catch { /* giữ giá trị mặc định */ }

      // Gọi AI /plant_garden với ảnh ngày hôm nay để cập nhật các task còn lại
      const aiPayload = {
        plant_name: gardenPlant.aiLabel,
        disease_name: gardenPlant.currentCondition,
        user_goal: gardenPlant.userGoal,
        weather_forecast: weatherToday,
        current_day: currentDay,          // AI biết đang ở ngày thứ mấy
        image_url: imageUrl,              // Ảnh ngày hôm nay để AI đánh giá tình trạng
      };
      const aiResp = await axios.post(`${this.aiServiceUrl}/plant_garden`, aiPayload);
      const aiData = aiResp.data;

      // Cập nhật lại tình trạng cây dựa trên kết quả AI hôm nay
      if (aiData.daily_tasks) {
        // Giữ các task đã hoàn thành, thay thế các task chưa làm bằng lộ trình mới
        const completedTasks = gardenPlant.careRoadmap.filter(t => t.isCompleted);
        const newTasks = (aiData.daily_tasks ?? []).map((task, idx) => ({
          ...task,
          day: currentDay + idx,
          date: new Date(today.getTime() + idx * 24 * 60 * 60 * 1000),
          isCompleted: false,
        }));
        updatedRoadmap = [...completedTasks, ...newTasks] as any;
      }

      // Cập nhật tình trạng cây nếu AI phát hiện thay đổi
      if (aiData.roadmap_summary) {
        gardenPlant.roadmapSummary = aiData.roadmap_summary;
      }
    } catch (err) {
      // Nếu AI bận thì vẫn check-in bình thường, không crash
      this.logger?.warn?.(`[CHECK-IN] AI không phản hồi, dùng roadmap cũ: ${err.message}`);
    }

    // Đánh dấu hoàn thành task hôm nay
    const taskIndex = updatedRoadmap.findIndex((t: any) => t.day === currentDay);
    if (taskIndex !== -1) {
      (updatedRoadmap[taskIndex] as any).isCompleted = true;
    }
    gardenPlant.careRoadmap = updatedRoadmap as any;

    // Tính % hoàn thành
    const completedCount = gardenPlant.careRoadmap.filter((t: any) => t.isCompleted).length;
    const totalCount = gardenPlant.careRoadmap.length;
    gardenPlant.progressPercentage = totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    gardenPlant.lastInteractionDate = today;

    if (gardenPlant.progressPercentage >= 100) {
      gardenPlant.status = 'COMPLETED';
    }

    await gardenPlant.save();

    return {
      requireRegeneration: false,
      message: 'Check-in thành công! Bạn đang làm rất tốt.',
      progressPercentage: gardenPlant.progressPercentage,
      status: gardenPlant.status,
      todayTask: gardenPlant.careRoadmap.find((t: any) => t.day === currentDay) ?? null,
    };
  }

  // ==========================================
  // 4. HỦY/XÓA CÂY (TRẢ LẠI SLOT CHO USER)
  // ==========================================
  async removePlantFromGarden(gardenId: string, userId: string) {
    const deletedPlant = await this.myGardenModel.findOneAndDelete({
      _id: gardenId,
      userId: new Types.ObjectId(userId),
    });
    if (!deletedPlant) throw new NotFoundException('Không tìm thấy cây này trong vườn.');
    return { message: 'Đã xóa cây. Bạn đã nhận lại 1 vị trí trống trong vườn.' };
  }
}