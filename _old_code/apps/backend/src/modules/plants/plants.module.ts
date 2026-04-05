import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { Plant, PlantSchema } from '@agri-scan/database';
import { Disease, DiseaseSchema } from '@agri-scan/database';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plant.name, schema: PlantSchema },
      { name: Disease.name, schema: DiseaseSchema },
    ]),
  ],
  controllers: [PlantsController],
  providers: [PlantsService],
  exports: [PlantsService], // Export để module ai-scan sau này có thể xài ké
})
export class PlantsModule {}