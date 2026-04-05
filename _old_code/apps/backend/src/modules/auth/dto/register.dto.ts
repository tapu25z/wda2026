import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  // 1. Validate Họ và tên
  @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự.' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
  @MaxLength(50, { message: 'Họ và tên không được vượt quá 50 ký tự.' })
  @Matches(
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/,
    { message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt.' }
  )
  fullName: string;

  // 2. Validate Email
  @IsNotEmpty({ message: 'Email không được để trống.' })
  @IsString({ message: 'Email phải là chuỗi ký tự.' })
  @IsEmail({}, { message: 'Email không đúng định dạng (ví dụ: ten@domain.com).' })
  email: string;

  // 3. Validate Mật khẩu
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  // IsStrongPassword hỗ trợ check cực chuẩn 4 yếu tố: hoa, thường, số, ký tự đặc biệt
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, { 
    message: 'Mật khẩu phải từ 8 ký tự trở lên, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt.' 
  })
  password: string;
}