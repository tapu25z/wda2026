import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống!' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự!' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!',
  })
  newPassword: string;
}
