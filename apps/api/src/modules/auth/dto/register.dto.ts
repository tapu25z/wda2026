import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsStrongPassword,
} from "class-validator";

export class RegisterDto {
  @IsNotEmpty({ message: "Họ và tên không được để trống." })
  @IsString()
  @MinLength(2, { message: "Họ và tên phải có ít nhất 2 ký tự." })
  @MaxLength(50, { message: "Họ và tên không quá 50 ký tự." })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/u, {
    message: "Họ tên chỉ gồm chữ cái và khoảng trắng.",
  })
  fullName: string;

  @IsNotEmpty({ message: "Email không được để trống." })
  @IsEmail({}, { message: "Email không đúng định dạng." })
  email: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống." })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Mật khẩu từ 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.",
    },
  )
  password: string;
}
