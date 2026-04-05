import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Import Schemas
import { WeatherRuleSchema } from '../schemas/Weather-rule.schema';
import { ProductSchema } from '../schemas/product.schema';
import { OrderSchema } from '../schemas/order.schema';

// Import Data (Hoặc bạn có thể copy trực tiếp mảng dữ liệu vào đây)
// Ở đây tôi giả định bạn đã export các mảng dữ liệu từ các file trước
import weatherRulesData from './weather-rules.seed'; 
import productsData from './products.seed';
import ordersData from './orders.seed';

dotenv.config({ path: path.resolve(__dirname, '../../../../apps/backend/.env') });

async function runMasterSeed() {
  const URI = process.env.DB_URI || 'mongodb://admin:secretPassword@localhost:27018/agriscan?authSource=admin';

  try {
    console.log('🚀 --- BẮT ĐẦU QUÁ TRÌNH MASTER SEED ---');
    await mongoose.connect(URI);
    console.log('✅ Kết nối MongoDB thành công!');

    // Khởi tạo Models
    const WeatherRuleModel = mongoose.model('WeatherRule', WeatherRuleSchema);
    const ProductModel = mongoose.model('Product', ProductSchema);
    const OrderModel = mongoose.model('Order', OrderSchema);

    // 1. Dọn dẹp dữ liệu cũ
    console.log('🧹 Đang dọn dẹp dữ liệu cũ...');
    await Promise.all([
      WeatherRuleModel.deleteMany({}),
      ProductModel.deleteMany({}),
      OrderModel.deleteMany({})
    ]);

    // 2. Chèn dữ liệu mới
    console.log('📥 Đang nạp dữ liệu mới...');
    
    // Lưu ý: Nên seed Product trước Order vì Order phụ thuộc vào ID Product
    await WeatherRuleModel.insertMany(weatherRulesData);
    console.log(`- Đã thêm ${weatherRulesData.length} Weather Rules`);

    await ProductModel.insertMany(productsData);
    console.log(`- Đã thêm ${productsData.length} Products`);

    await OrderModel.insertMany(ordersData);
    console.log(`- Đã thêm ${ordersData.length} Orders`);

    console.log('✨ --- TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC SEED THÀNH CÔNG! ---');
  } catch (error) {
    console.error('❌ Lỗi Master Seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

runMasterSeed();