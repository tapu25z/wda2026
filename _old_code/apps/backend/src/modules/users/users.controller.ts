import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsEnum } from 'class-validator';


export enum UserPlan {
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}
export class UpgradePlanDto {
  @IsEnum(UserPlan, { message: 'Gói phải là PREMIUM hoặc VIP.' })
  plan: UserPlan;
}
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  async upgradePlan(@Request() req, @Body() body: UpgradePlanDto) {
    // Truy cập qua body.plan
    const updatedUser = await this.usersService.upgradePlan(req.user.userId, body.plan);

    return {
      message: `Nâng cấp gói ${body.plan} thành công!`,
      plan: updatedUser.plan,
      expiresAt: updatedUser.planExpiresAt,
    };
  }
}