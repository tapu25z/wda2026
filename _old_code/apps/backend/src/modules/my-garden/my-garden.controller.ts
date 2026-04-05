import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MyGardenService } from './my-garden.service';
import { AddPlantToGardenDto, DailyCheckInDto } from './dto/my-garden.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('my-garden')
@UseGuards(JwtAuthGuard) // Bắt buộc user phải đăng nhập mới được dùng
export class MyGardenController {
    constructor(private readonly myGardenService: MyGardenService) { }

    @Get()
    async getUserGarden(@Req() req) {
        const userId = req.user.userId; 
        return this.myGardenService.getUserGarden(userId);
    }

    @Post()
    async addPlantToGarden(@Req() req, @Body() dto: AddPlantToGardenDto) {
        const userId = req.user.userId;
        return this.myGardenService.addPlantToGarden({ userId, ...dto });
    }

    @Post(':id/check-in')
    async dailyCheckIn(@Req() req, @Param('id') gardenId: string, @Body() dto: DailyCheckInDto) {
        const userId = req.user.userId;
        // BUG 6 FIX: truyền đủ imageUrl, lat, lon xuống service
        return this.myGardenService.dailyCheckIn(
            gardenId,
            userId,
            dto.currentDay,
            dto.imageUrl,
            dto.lat,
            dto.lon,
        );
    }

    @Delete(':id')
    async removePlant(@Req() req, @Param('id') gardenId: string) {
        const userId = req.user.userId; 
        return this.myGardenService.removePlantFromGarden(gardenId, userId);
    }
}