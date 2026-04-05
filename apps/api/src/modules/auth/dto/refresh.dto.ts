import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
  @IsNotEmpty({ message: "Thiếu refresh token." })
  @IsString()
  refreshToken: string;
}
