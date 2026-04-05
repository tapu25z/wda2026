import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddPlantToGardenDto {
  // BUG 3 FIX: Tách riêng plant_name và disease_name từ ViT model output
  // ViT trả về: { plant_name: "Cà chua", disease_name: "Đốm vòng" | "Khỏe mạnh" }
  // Backend cần cả 2 để build prompt đúng cho /plant_garden
  @IsString()
  @IsNotEmpty()
  plantName: string; // Tên cây từ ViT (VD: "Cà chua", "Hoa hồng")

  @IsString()
  @IsNotEmpty()
  diseaseName: string; // Tên bệnh từ ViT hoặc "Khỏe mạnh" nếu cây khỏe

  @IsString()
  @IsOptional()
  imageUrl?: string; // Ảnh người dùng vừa quét (để hiển thị trong vườn)

  @IsString()
  @IsOptional()
  customName?: string;

  @IsString()
  @IsNotEmpty()
  userGoal: string; // VD: 'GET_FRUIT', 'HEAL_DISEASE', 'GENERAL_CARE'

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;
}

export class DailyCheckInDto {
  @IsNumber()
  @IsNotEmpty()
  currentDay: number;

  // BUG 6 FIX: imageUrl bắt buộc cho daily check-in
  // Theo spec: "mỗi ngày người dùng phải chụp 1 ảnh để AI phân tích tình trạng cây"
  // Frontend phải upload ảnh trước (qua /scan/analyze) rồi gửi URL về đây
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  // Toạ độ để lấy thời tiết ngày hôm đó
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lon: number;
}