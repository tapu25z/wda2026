import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email: string;

  @IsNotEmpty({ message: 'OTP không được để trống.' })
  @IsString()
  @Length(6, 6, { message: 'Mã OTP phải có đúng 6 ký tự.' }) // Ép cứng đúng 6 số
  otp: string;
}