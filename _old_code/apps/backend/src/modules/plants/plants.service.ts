import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plant, Disease } from '@agri-scan/database';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';

@Injectable()
export class PlantsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PlantsService.name);

  constructor(
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
    @InjectModel(Disease.name) private diseaseModel: Model<Disease>,
  ) { }

  async onApplicationBootstrap() {
    const count = await this.plantModel.countDocuments();

    if (count === 0) {
      // Lần đầu tiên: DB trống → seed toàn bộ
      console.log('🌱 DB trống, đang seed dữ liệu lần đầu...');
      try {
        const result = await this.seedData();
        console.log(result.message);
      } catch (error) {
        console.error('⚠️ Seed thất bại:', (error as Error).message);
      }
    } else {
      // DB đã có data → chỉ sync (upsert) không xóa, im lặng để không spam log
      console.log(`🌱 DB đã có ${count} cây. Đang đồng bộ dữ liệu AI...`);
      try {
        const result = await this.seedData();
        console.log(result.message);
      } catch (error) {
        console.error('⚠️ Sync thất bại:', (error as Error).message);
      }
    }
    const plantsPath = path.join(process.cwd(), '..', 'ai-service', 'data', 'plants_data.json');

  }
async findDiseaseByLabel(label: string) {
  if (!label) return null;
  
  try {
    // 1. Tìm chính xác theo tên
    let disease = await this.diseaseModel.findOne({
      name: { $regex: label, $options: 'i' }
    }).exec();
    
    if (disease) return disease;
    
    // 2. Nếu không có, tách label (format: "Plant___Disease")
    const cleanLabel = label.replace(/___/g, ' ').replace(/_/g, ' ');
    const words = cleanLabel.split(' ');
    
    if (words.length > 1) {
      // Bỏ tên cây, chỉ lấy tên bệnh (phần sau)
      const diseaseName = words.slice(1).join(' ');
      disease = await this.diseaseModel.findOne({
        name: { $regex: diseaseName, $options: 'i' }
      }).exec();
      
      if (disease) return disease;
    }
    
    this.logger.warn(`Không tìm thấy disease cho label: ${label}`);
    return null;
    
  } catch (error) {
    this.logger.error('Lỗi khi tìm disease:', error);
    return null;
  }
}
  // 1. Lấy danh sách cây (Chỉ lấy APPROVED hoặc data cũ chưa có trường status)
  async findAllPlants() {
    return this.plantModel.find({
      $or: [{ status: 'APPROVED' }, { status: { $exists: false } }]
    }).select('commonName scientificName family images status category growthRate light water').exec();
  }

  // 2. Lấy chi tiết 1 loại cây
  async findPlantById(id: string) {
    const plant = await this.plantModel.findById(id).populate('diseases').exec();
    if (!plant) {
      throw new NotFoundException(`Không tìm thấy cây với ID: ${id}`);
    }
    return plant;
  }

  // 3. Tìm bệnh theo tên
  async findDiseaseByName(diseaseName: string) {
    return this.diseaseModel.findOne({ name: diseaseName }).exec();
  }

  // 🔥 4. THÊM MỚI: Xử lý người dùng đóng góp dữ liệu cây trồng
  async contributePlant(plantData: any) {
    const newPlant = new this.plantModel({
      ...plantData,
      status: 'PENDING' // Luôn ép về PENDING khi user gửi
    });
    return newPlant.save();
  }

  async seedData() {
    try {
      // 1. ĐỌC FILE CÂY TRỒNG
      const plantsPath = path.join(process.cwd(), '..', 'ai-service', 'data', 'plant_knowledge.json');
      const plantsRawData = fs.readFileSync(plantsPath, 'utf-8');
      const plantsList = JSON.parse(plantsRawData);

      // 🔥 FIX LỖI TYPE 'never': Khai báo rõ kiểu dữ liệu là mảng chứa bất kỳ object nào (any[])
      const plantDocs: any[] = [];

      for (const plantData of plantsList) {
        const plant = await this.plantModel.findOneAndUpdate(
          { scientificName: plantData.scientificName },
          plantData,
          { upsert: true, new: true }
        );

        // 🔥 Bổ sung kiểm tra plant tồn tại để tránh lỗi strict null check
        if (plant) {
          plant.diseases = []; // Reset mảng bệnh trước khi nối lại
          await plant.save();
          plantDocs.push(plant);
        }
        
      }

      // 2. ĐỌC FILE BỆNH TỪ TEAM AI
      const diseasePath = path.join(process.cwd(), '..', 'ai-service', 'data', 'plant_knowledge.json');
      const diseaseRawData = fs.readFileSync(diseasePath, 'utf-8');
      const diseaseList: any[] = JSON.parse(diseaseRawData);
      let diseaseCount = 0;

      for (const diseaseData of diseaseList) {
        const isHealthy = diseaseData.type === 'HEALTHY' || diseaseData.name?.toLowerCase().includes('healthy');

        const savedDisease = await this.diseaseModel.findOneAndUpdate(
          { name: diseaseData.name },
          diseaseData, // Truyền trực tiếp object JSON vào
          { upsert: true, new: true }
        );
        diseaseCount++;


        const commonNameString = diseaseData.commonName || '';
        const match = commonNameString.match(/\((.*?)\)/);

        if (match && match[1]) {
          const scientificNameFromDisease = match[1];
          // Tìm cây tương ứng đã được insert ở bước 1
          const targetPlant = plantDocs.find(p => p.scientificName === scientificNameFromDisease);

          if (targetPlant && !isHealthy) { // Chỉ nhét các bệnh thực sự vào mảng diseases của cây
            // Ép kiểu ID sang string để kiểm tra trùng lặp (tránh 1 bệnh bị push 2 lần khi chạy seed nhiều lần)
            const diseaseIdStr = savedDisease._id.toString();
            const hasDisease = targetPlant.diseases.some((id: any) => id.toString() === diseaseIdStr);

            if (!hasDisease) {
              targetPlant.diseases.push(savedDisease._id);
              await targetPlant.save();
            }
          }
        }
      }

      return { message: `Đã bơm thành công ${plantDocs.length} cây và ${diseaseCount} bệnh vào Database! 🌳` };
    } catch (error) {
      console.error('Lỗi khi bơm dữ liệu:', error);
      throw new Error('Bơm dữ liệu thất bại, vui lòng kiểm tra lại đường dẫn file JSON.');
    }
    
  }
}