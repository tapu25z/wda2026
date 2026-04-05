import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyGardenController } from './my-garden.controller';
import { MyGardenService } from './my-garden.service';
import { WeatherModule } from '../weather/Weather.module';
import {
  MyGarden, MyGardenSchema,
  User, UserSchema,
  // BUG 7 FIX: Bỏ Plant + PlantSchema — service không còn populate 'plantId' nữa
  // Nếu để lại sẽ bị lỗi "Nest can't resolve dependencies" hoặc inject thừa
} from '@agri-scan/database';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MyGarden.name, schema: MyGardenSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WeatherModule,
  ],
  controllers: [MyGardenController],
  providers: [MyGardenService],
  exports: [MyGardenService],
})
export class MyGardenModule {}
