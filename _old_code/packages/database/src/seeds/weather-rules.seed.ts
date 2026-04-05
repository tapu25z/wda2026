const weatherRulesSeed = [
  // ==============================
  // CẢNH BÁO NHIỆT ĐỘ (WARNING)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '🌡️ Nhiệt độ quá cao - Nguy cơ cháy lá',
    message: 'Nhiệt độ hiện tại vượt 35°C. Hãy che phủ cây bằng lưới cắt nắng (50-70%), tưới nước vào sáng sớm và chiều tối. Tránh tuyệt đối tưới giữa trưa khi nhiệt độ cao.',
    dataSource: 'current',
    conditions: { minTemp: 35 },
    priority: 90,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '❄️ Nhiệt độ thấp - Nguy cơ sương giá',
    message: 'Nhiệt độ xuống dưới 10°C. Phủ bạt hoặc rơm rạ để giữ ấm gốc cây. Hạn chế tưới nước vào buổi tối. Theo dõi chặt các cây nhiệt đới.',
    dataSource: 'current',
    conditions: { maxTemp: 10 },
    priority: 90,
    isActive: true,
  },
  {
    targetCategory: 'FRUIT',
    adviceType: 'WARNING',
    title: '🔥 Nắng gắt - Nguy cơ rụng trái non',
    message: 'Nhiệt độ cao liên tục làm tăng tỷ lệ rụng trái non trên cây ăn quả. Tăng cường tưới giữ ẩm đất và phun phân bón lá giàu Canxi-Bo vào sáng sớm.',
    dataSource: 'daily',
    conditions: { minTemp: 36 },
    priority: 88,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '⚠️ Sốc nhiệt - Biến động nhiệt độ lớn',
    message: 'Chênh lệch nhiệt độ ngày và đêm quá lớn (>15°C). Cây dễ bị sốc sinh lý, ngừng phát triển. Bổ sung Amino Acid hoặc Vitamin B1 để tăng sức đề kháng.',
    dataSource: 'daily',
    conditions: { maxTemp: 35, minTemp: 18 }, // Ví dụ mô phỏng biên độ nhiệt
    priority: 85,
    isActive: true,
  },

  // ==============================
  // CẢNH BÁO ĐỘ ẨM & NẤM BỆNH (WARNING)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '💧 Độ ẩm quá cao - Cảnh báo nấm bệnh',
    message: 'Độ ẩm không khí vượt 85%. Môi trường lý tưởng cho nấm mốc và vi khuẩn phát triển. Kiểm tra mặt dưới lá thường xuyên, tăng thông gió giữa các luống cây, cân nhắc phun phòng thuốc gốc đồng.',
    dataSource: 'current',
    conditions: { minHumidity: 85 },
    priority: 85,
    isActive: true,
  },
  {
    targetCategory: 'VEGETABLE',
    adviceType: 'WARNING',
    title: '🍄 Nguy cơ thối nhũn cao trên rau ăn lá',
    message: 'Kết hợp nhiệt độ ấm và độ ẩm cao rất nguy hiểm cho rau ăn lá. Tăng khoảng cách trồng, cắt tỉa lá già. Phun Trichoderma để phòng ngừa nấm đất.',
    dataSource: 'current',
    conditions: { minTemp: 25, minHumidity: 80 },
    priority: 88,
    isActive: true,
  },
  {
    targetCategory: 'FLOWER',
    adviceType: 'WARNING',
    title: '🥀 Sương mù/Sương mai ban mai',
    message: 'Trời có sương mù và độ ẩm sáng sớm cao. Dễ gây bệnh sương mai trên hoa hồng, cúc. Tuyệt đối không tưới ướt lá vào buổi tối, dọn sạch lá rụng dưới gốc.',
    dataSource: 'hourly',
    conditions: { weatherMain: 'Mist', minHumidity: 90 },
    priority: 82,
    isActive: true,
  },

  // ==============================
  // CẢNH BÁO MƯA, TƯỚI NƯỚC & PHUN THUỐC (WARNING)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '🌧️ Dự báo mưa lớn - Nguy cơ úng rễ',
    message: 'Xác suất mưa trong 24h tới trên 80%. Kiểm tra và cải thiện hệ thống thoát nước. Không bón phân hôm nay - mưa sẽ làm trôi phân và ô nhiễm nguồn nước.',
    dataSource: 'hourly',
    conditions: { minPop: 0.8 },
    priority: 80,
    isActive: true,
  },
  {
    targetCategory: 'FLOWER',
    adviceType: 'WARNING',
    title: '🌺 Mưa lớn - Bảo vệ hoa đang nở',
    message: 'Mưa to có thể làm hỏng hoa đang nở. Di chuyển chậu vào mái hiên, hoặc dùng khung che tạm thời. Sau mưa, kiểm tra và loại bỏ hoa bị úng ngay.',
    dataSource: 'hourly',
    conditions: { minPop: 0.75 },
    priority: 82,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '☔ Không phun thuốc sinh học/hóa học',
    message: 'Dự báo có mưa rào trong vài giờ tới. Dừng ngay việc phun thuốc sâu/phân bón lá vì nước mưa sẽ rửa trôi thuốc, gây lãng phí và không đạt hiệu quả.',
    dataSource: 'hourly',
    conditions: { minPop: 0.6, weatherMain: 'Rain' },
    priority: 95,
    isActive: true,
  },
  {
    targetCategory: 'FRUIT',
    adviceType: 'WARNING',
    title: '🍎 Mưa kéo dài - Nứt quả',
    message: 'Mưa liên tục nhiều ngày làm lượng nước tích tụ trong quả tăng đột ngột gây nứt quả (cà chua, dưa hấu, chanh dây). Khơi thông rãnh thoát nước ngay lập tức.',
    dataSource: 'daily',
    conditions: { weatherMain: 'Rain', minHumidity: 85 },
    priority: 87,
    isActive: true,
  },

  // ==============================
  // CẢNH BÁO GIÓ MẠNH & TIA UV (WARNING)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '💨 Gió mạnh - Nguy cơ gãy cành',
    message: 'Tốc độ gió trên 10 m/s (36 km/h). Cắm cọc và buộc dây cho cây cao, leo. Di chuyển chậu nhỏ vào nơi khuất gió. Kiểm tra và gia cố giàn lưới.',
    dataSource: 'current',
    conditions: { minWindSpeed: 10 },
    priority: 75,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'WARNING',
    title: '🚫 Gió to - Dừng phun xịt',
    message: 'Gió đang thổi rất mạnh (>7 m/s). Dừng mọi hoạt động phun xịt hóa chất để tránh thuốc bị tạt gió bay sang khu vực khác hoặc bám vào người phun.',
    dataSource: 'current',
    conditions: { minWindSpeed: 7 },
    priority: 92,
    isActive: true,
  },
  {
    targetCategory: 'VEGETABLE',
    adviceType: 'WARNING',
    title: '☢️ Chỉ số UV cực cao - Héo rũ',
    message: 'Chỉ số tia cực tím (UV) đang ở mức cực kỳ nguy hiểm (>10). Cây non và rau màu dễ bị cháy lá sạm màu. Kéo lưới lan che nắng khẩn cấp.',
    dataSource: 'current',
    conditions: { minUvi: 10 },
    priority: 85,
    isActive: true,
  },

  // ==============================
  // KHUYẾN NGHỊ TƯỚI NƯỚC (RECOMMEND)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '☀️ Thời tiết nắng đẹp - Lý tưởng để tưới nước',
    message: 'Thời tiết nắng, không có mưa. Đây là thời điểm tốt để tưới vào sáng sớm (6-8h), để đất kịp khô trước đêm. Tưới đẫm nhưng đúng lượng.',
    dataSource: 'current',
    conditions: { weatherMain: 'Clear', maxHumidity: 70 },
    priority: 60,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '🌤️ Trời mây nhẹ - Thích hợp cấy ghép',
    message: 'Nhiệt độ và ánh sáng ôn hòa. Đây là điều kiện tuyệt vời để trồng mới, giâm cành hoặc tái chậu. Cây sẽ ít bị sốc nhiệt hơn.',
    dataSource: 'current',
    conditions: { weatherMain: 'Clouds', minTemp: 20, maxTemp: 30 },
    priority: 55,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '🏜️ Thời tiết hanh khô - Tăng lượng tưới',
    message: 'Trời nắng nóng kèm độ ẩm thấp (<50%), tốc độ bốc hơi nước rất nhanh. Tăng lượng nước tưới lên 20-30%, kết hợp phủ rơm rạ hoặc mụn dừa quanh gốc để giữ ẩm.',
    dataSource: 'current',
    conditions: { maxHumidity: 50, minTemp: 30 },
    priority: 65,
    isActive: true,
  },

  // ==============================
  // KHUYẾN NGHỊ BÓN PHÂN & XỬ LÝ ĐẤT (RECOMMEND)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '🌱 Điều kiện tốt để bón phân hữu cơ',
    message: 'Độ ẩm đất và nhiệt độ đang ở mức lý tưởng. Bón phân compost hoặc phân trùn quế kết hợp tưới nước nhẹ để phân thẩm sâu vào đất.',
    dataSource: 'current',
    conditions: { minTemp: 20, maxTemp: 30, minHumidity: 50, maxHumidity: 75 },
    priority: 65,
    isActive: true,
  },
  {
    targetCategory: 'FRUIT',
    adviceType: 'RECOMMEND',
    title: '🍅 Thời điểm bón thúc cho cây ăn quả',
    message: 'Thời tiết ổn định, lý tưởng để bón phân NPK thúc đẩy trái lớn. Bón cách gốc 20-30cm, xới nhẹ đất lấp phân để tránh bốc hơi sương.',
    dataSource: 'daily',
    conditions: { maxTemp: 33, maxHumidity: 70, maxWindSpeed: 7 },
    priority: 70,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '🌧️ Sau cơn mưa - Rải vôi bột',
    message: 'Trời vừa tạnh mưa lớn. Đất có xu hướng bị axit hóa. Khuyến nghị rải một lớp mỏng vôi bột nông nghiệp quanh luống để cân bằng pH và diệt mầm bệnh.',
    dataSource: 'hourly',
    conditions: { weatherMain: 'Clear', minHumidity: 80 }, // Giả định tạnh mưa, ẩm độ còn cao
    priority: 60,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'RECOMMEND',
    title: '✂️ Thời điểm vàng để cắt tỉa',
    message: 'Trời khô ráo, gió nhẹ, độ ẩm thấp. Lý tưởng để cắt tỉa cành la, cành tăm, lá bệnh. Vết cắt sẽ nhanh khô, vi khuẩn khó xâm nhập.',
    dataSource: 'current',
    conditions: { maxHumidity: 65, maxWindSpeed: 5, weatherMain: 'Clear' },
    priority: 62,
    isActive: true,
  },

  // ==============================
  // THÔNG TIN CHĂM SÓC (INFO)
  // ==============================
  {
    targetCategory: 'ALL',
    adviceType: 'INFO',
    title: '☁️ Trời âm u - Quang hợp giảm',
    message: 'Trời nhiều mây, ánh sáng yếu. Giảm lượng tưới nước 20-30% vì cây quang hợp ít hơn. Đây là thời điểm tốt để bón phân bón lá (nếu không mưa).',
    dataSource: 'current',
    conditions: { weatherMain: 'Clouds', maxTemp: 28 },
    priority: 30,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'INFO',
    title: '🔆 Chỉ số UV cao - Chú ý an toàn',
    message: 'UV Index hiện tại cao (≥6). Nên làm vườn vào sáng sớm hoặc sau 16h. Mặc áo bảo hộ và bôi kem chống nắng khi làm việc dưới nắng.',
    dataSource: 'current',
    conditions: { minUvi: 6 },
    priority: 25,
    isActive: true,
  },
  {
    targetCategory: 'VEGETABLE',
    adviceType: 'INFO',
    title: '🥬 Nhiệt độ lý tưởng cho rau ăn lá',
    message: 'Nhiệt độ trong khoảng 20-28°C là điều kiện tốt nhất cho rau ăn lá tăng trưởng. Đảm bảo đủ ẩm và dinh dưỡng Nitơ (N) để cây xanh tốt.',
    dataSource: 'current',
    conditions: { minTemp: 20, maxTemp: 28 },
    priority: 20,
    isActive: true,
  },
  {
    targetCategory: 'ALL',
    adviceType: 'INFO',
    title: '🐝 Gió nhẹ & Nắng ấm - Côn trùng thụ phấn',
    message: 'Thời tiết cực kỳ thuận lợi cho ong bướm bay đi thụ phấn hoa. Hạn chế sử dụng bất kỳ loại hóa chất có mùi nồng nào trong vườn vào lúc này.',
    dataSource: 'current',
    conditions: { minTemp: 22, maxTemp: 29, maxWindSpeed: 3, weatherMain: 'Clear' },
    priority: 15,
    isActive: true,
  },
  {
    targetCategory: 'FRUIT',
    adviceType: 'INFO',
    title: '🛒 Sắp có mưa bão - Thu hoạch sớm',
    message: 'Dự báo vài ngày tới có mưa lớn diện rộng kéo dài. Hãy tranh thủ thu hoạch ngay các loại trái cây đã đạt độ chín 80-90% để tránh hư hỏng rụng rớt.',
    dataSource: 'daily',
    conditions: { minPop: 0.9 }, // Dự báo xác suất mưa cực cao trong ngày
    priority: 40,
    isActive: true,
  },
  {
    targetCategory: 'FLOWER',
    adviceType: 'INFO',
    title: '🌿 Nhiệt độ giảm dần về đêm',
    message: 'Biên độ nhiệt ban đêm bắt đầu giảm, tạo điều kiện thuận lợi cho sự phân hóa mầm hoa ở một số loại cây cảnh. Duy trì chế độ lân (P) đầy đủ.',
    dataSource: 'daily',
    conditions: { maxTemp: 24, minTemp: 15 },
    priority: 10,
    isActive: true,
  }
];
export default weatherRulesSeed;