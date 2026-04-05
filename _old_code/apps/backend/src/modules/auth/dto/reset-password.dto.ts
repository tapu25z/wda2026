import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  resetToken: string;

  @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, {
    message: 'Mật khẩu phải từ 8 ký tự, gồm hoa, thường, số và ký tự đặc biệt.'
  })
  newPassword: string;
}