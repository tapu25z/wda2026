import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@agri-scan/database';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Payment, PaymentSchema } from '@agri-scan/database';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Payment.name, schema: PaymentSchema },
  ])],
  controllers: [UsersController], // THÊM DÒNG NÀY
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }