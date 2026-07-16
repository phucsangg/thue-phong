import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Room, RoomType, RoomStatus } from '../models/Room';
import { RentalRequest } from '../models/RentalRequest';
import { RefreshToken } from '../models/RefreshToken';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentnow';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Cleaning up existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await RentalRequest.deleteMany({});
    await RefreshToken.deleteMany({});
    console.log('Database cleaned.');

    // Create users
    console.log('Creating seed users...');
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    const userPasswordHash = await bcrypt.hash('user123', saltRounds);

    const adminUser = await User.create({
      name: 'iSinhvien Admin',
      email: 'admin@rentnow.com',
      passwordHash: adminPasswordHash,
      passwordPlain: 'admin123',
      phone: '0786804768',
      avatar: '/avatar.jpg',
      role: 'ADMIN',
      isVerified: true,
    });

    const standardUser = await User.create({
      name: 'John Doe',
      email: 'user@rentnow.com',
      passwordHash: userPasswordHash,
      passwordPlain: 'user123',
      phone: '0123456789',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      role: 'USER',
      isVerified: true,
    });

    console.log(`Users created: Admin (${adminUser.email}), User (${standardUser.email})`);

    // Helper to generate a slug
    const makeSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    // 18 seed rooms data — hoàn toàn tiếng Việt có dấu
    const roomsData = [
      {
        name: 'Studio Hiện Đại Trung Tâm Quận 1',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio sang trọng, ấm cúng và đầy đủ tiện nghi ngay trung tâm Quận 1. Được trang bị điều hòa Inverter thế hệ mới tiết kiệm điện, giường King-size cao cấp, tivi thông minh, máy giặt riêng, và căn bếp hiện đại có sẵn bếp từ hồng ngoại và tủ lạnh side-by-side. Không gian sống được thiết kế tối giản ngập tràn ánh sáng tự nhiên từ cửa sổ kính lớn sát trần. Vị trí đắc địa, chỉ mất 3 phút đi bộ ra phố đi bộ Nguyễn Huệ, xung quanh nhiều quán cà phê, siêu thị tiện lợi 24/7 và hệ thống an ninh 3 lớp cực kỳ an toàn cho sinh viên và người đi làm trẻ.',
        address: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
        district: 'Quận 1',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 15000000,
        area: 32,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Smart TV', 'Thang máy', 'Bảo vệ 24/7'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Phòng Đơn Sinh Viên Gần Bách Khoa Hà Nội',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng trọ đơn khép kín giá rẻ, đặc biệt phù hợp cho các bạn tân sinh viên trường Đại học Bách Khoa, Kinh Tế Quốc Dân hoặc Xây Dựng Hà Nội. Phòng trang bị đầy đủ giường đơn chắc chắn, tủ quần áo hai buồng rộng rãi, bàn học tập chuẩn kích thước và quạt mát. Vệ sinh khép kín sạch sẽ có sẵn bình nóng lạnh. Nằm trong khu dân trí cao cực kỳ an ninh và yên tĩnh phục vụ tốt nhất cho việc học tập nghiên cứu. Chi phí điện nước được tính theo giá nhà nước rõ ràng, minh bạch.',
        address: '45 Đường Tạ Quang Bửu, Phường Bách Khoa',
        district: 'Quận Hai Bà Trưng',
        city: 'Hà Nội',
        pricePerMonth: 3500000,
        area: 15,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Giường', 'Tủ quần áo', 'Chỗ để xe'],
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ 2 Phòng Ngủ View Sông Thảo Điền',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ sang trọng tại dự án cao cấp Masteri Thảo Điền Quận 2. Gồm 2 phòng ngủ lớn tràn ngập ánh sáng, ban công rộng rãi với tầm nhìn vô cực ôm trọn dòng sông Sài Gòn thơ mộng. Full nội thất cao cấp nhập khẩu từ châu Âu bao gồm sofa da cao cấp, bếp đảo tiện nghi, máy giặt sấy đồng bộ, tivi OLED 65 inch. Tiện ích nội khu miễn phí cao cấp như hồ bơi tràn bờ dài 50m, phòng tập gym đầy đủ thiết bị hiện đại, sân chơi thể thao và trung tâm thương mại Vincom Mega Mall ngay dưới chân tòa nhà. Thích hợp cho hộ gia đình hoặc nhóm bạn sinh viên ở ghép.',
        address: 'Masteri Thảo Điền, 159 Đường Xa Lộ Hà Nội',
        district: 'Quận 2',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 28000000,
        area: 75,
        maxPeople: 4,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Hồ bơi', 'Phòng gym', 'Ban công', 'Bảo vệ 24/7'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Phòng Đôi Gần Biển Mỹ Khê Đà Nẵng',
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng đôi chỉ cách bãi biển Mỹ Khê 5 phút đi bộ. Không khí biển trong lành, dịch vụ dọn phòng 2 lần/tuần.',
        address: '78 Đường Võ Nguyên Giáp',
        district: 'Quận Ngũ Hành Sơn',
        city: 'Đà Nẵng',
        pricePerMonth: 8000000,
        area: 25,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'View biển'],
        images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Nhà Nguyên Căn 3 Tầng Quận 3',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Nhà 3 tầng tại Quận 3. Tầng trệt phù hợp làm văn phòng hoặc kinh doanh, các tầng trên để ở. Có sân vườn nhỏ và ga-ra ô tô.',
        address: '220 Đường Điện Biên Phủ',
        district: 'Quận 3',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 60000000,
        area: 180,
        maxPeople: 8,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Sân vườn', 'Ga-ra', 'Sân thượng'],
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Studio View Hồ Tây Đường Xuân Diệu',
        roomType: 'STUDIO' as RoomType,
        description: 'Studio trang trí đẹp với tầm nhìn ra Hồ Tây thơ mộng. Internet tốc độ cao, thân thiện vật nuôi, cộng đồng người nước ngoài sôi động.',
        address: '12 Đường Xuân Diệu',
        district: 'Quận Tây Hồ',
        city: 'Hà Nội',
        pricePerMonth: 12000000,
        area: 40,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'View hồ', 'Thân thiện vật nuôi', 'Ban công'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Phòng Đơn Giá Rẻ Quận 10',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng đơn giá bình dân trong hẻm yên tĩnh Quận 10. Gần chợ thực phẩm và bến xe buýt. Điện nước tính theo giá nhà nước.',
        address: '512 Đường Cách Mạng Tháng Tám',
        district: 'Quận 10',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 4000000,
        area: 16,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Giường', 'Tủ quần áo', 'Quạt điện'],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Penthouse Hạng Sang View Cầu Rồng Đà Nẵng',
        roomType: 'APARTMENT' as RoomType,
        description: 'Penthouse ấn tượng ngay trung tâm thành phố. Kính từ sàn tới trần, thiết bị bếp cao cấp và bồn tắm jacuzzi riêng tư.',
        address: 'Tòa Indochina Riverside, 74 Đường Bạch Đằng',
        district: 'Quận Hải Châu',
        city: 'Đà Nẵng',
        pricePerMonth: 42000000,
        area: 120,
        maxPeople: 4,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Hồ bơi', 'Phòng gym', 'View sông', 'Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Phòng Đôi Ấm Cúng Đường Duy Tân Cầu Giấy',
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng thoáng mát với nội thất gỗ hiện đại. Khu vực an ninh cao, hệ thống vào cửa bằng vân tay.',
        address: '15 Đường Duy Tân',
        district: 'Quận Cầu Giấy',
        city: 'Hà Nội',
        pricePerMonth: 6500000,
        area: 22,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'Tủ quần áo', 'Khóa vân tay'],
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Studio Phong Cách Bắc Âu Bình Thạnh',
        roomType: 'STUDIO' as RoomType,
        description: 'Studio thiết kế tối giản phong cách Bắc Âu. Sát Quận 1, đi lại rất thuận tiện. Có sân thượng chung yên tĩnh cho tất cả cư dân.',
        address: '88 Đường Nguyễn Gia Trí',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 10000000,
        area: 28,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Sân thượng'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Gia Đình Vinhomes Bình Thạnh',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ đẹp trong Vinhomes Central Park. Nội thất đầy đủ, nhà thông minh, gần bệnh viện, trường học và công viên lớn.',
        address: 'Park 6, 208 Đường Nguyễn Hữu Cảnh',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 25000000,
        area: 82,
        maxPeople: 5,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Hồ bơi', 'Phòng gym', 'Công viên', 'Nhà thông minh'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Nhà Kiểu Pháp Có Lò Sưởi Tại Đà Lạt',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Ngôi nhà cổ điển phong cách Pháp tại Đà Lạt với lò sưởi gỗ, vườn hoa cẩm tú cầu và không gian yên tĩnh. Lý tưởng cho gia đình nghỉ dưỡng.',
        address: '14 Đường Lê Hồng Phong',
        district: 'Phường 4',
        city: 'Đà Lạt',
        pricePerMonth: 20000000,
        area: 150,
        maxPeople: 6,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Bếp', 'Máy giặt', 'Lò sưởi', 'Sân vườn', 'View núi'],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Studio Mini Quận 4 Gần Cầu Khánh Hội',
        roomType: 'STUDIO' as RoomType,
        description: 'Studio nhỏ gọn có nhà vệ sinh riêng và bếp nhỏ. Chỉ 3 phút qua cầu Khánh Hội là tới Quận 1. Tiện lợi, giá hợp lý.',
        address: '320 Đường Đoàn Văn Bơ',
        district: 'Quận 4',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 7000000,
        area: 20,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp nhỏ', 'Tủ lạnh'],
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Phòng Đơn Homestay Sôi Động Nha Trang',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng đơn trong homestay náo nhiệt tại Nha Trang. Tầng trệt có quầy bar xã hội và bàn bida. Chủ nhà rất thân thiện.',
        address: '12 Đường Hùng Vương',
        district: 'Phường Lộc Thọ',
        city: 'Nha Trang',
        pricePerMonth: 3000000,
        area: 12,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bàn bida', 'Nướng BBQ', 'Thuê xe đạp'],
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Studio Sang Trọng Trung Tâm Hoàn Kiếm',
        roomType: 'STUDIO' as RoomType,
        description: 'Studio phong cách Hà Nội cổ điển trong Phố Cổ. Đi bộ tới Hồ Hoàn Kiếm, xung quanh nhiều di tích lịch sử văn hóa.',
        address: '15 Đường Hàng Bạc',
        district: 'Quận Hoàn Kiếm',
        city: 'Hà Nội',
        pricePerMonth: 13000000,
        area: 35,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Ban công cổ điển'],
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Biệt Thự 3 Phòng Ngủ View Biển Vũng Tàu',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Biệt thự biển rộng rãi với hồ bơi riêng, sân nướng BBQ và bàn bida. Lý tưởng cho gia đình nghỉ dưỡng cuối tuần.',
        address: '25 Đường Trần Phú',
        district: 'Phường 5',
        city: 'Vũng Tàu',
        pricePerMonth: 70000000,
        area: 350,
        maxPeople: 12,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Hồ bơi', 'Nướng BBQ', 'View biển', 'Ga-ra'],
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Bungalow Núi View Ruộng Bậc Thang Sapa',
        roomType: 'SINGLE' as RoomType,
        description: 'Bungalow gỗ ấm cúng giữa ruộng bậc thang hùng vĩ. Trải nghiệm văn hóa bản địa và ngắm sương mù buổi sáng tuyệt đẹp.',
        address: 'Bản Tả Van',
        district: 'Sa Pa',
        city: 'Lào Cai',
        pricePerMonth: 5000000,
        area: 20,
        maxPeople: 2,
        status: 'HIDDEN' as RoomStatus, // Phòng ẩn để kiểm tra quyền admin
        amenities: ['Wifi', 'Máy sưởi', 'Ban công', 'View núi', 'Bữa sáng'],
        images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Đang Bảo Trì Phú Mỹ Hưng Quận 7',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ hiện đại tại Phú Mỹ Hưng. Hiện đang kiểm tra bảo trì định kỳ và sẽ sớm mở lại.',
        address: '105 Đại Lộ Nguyễn Lương Bằng',
        district: 'Quận 7',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 18000000,
        area: 68,
        maxPeople: 3,
        status: 'MAINTENANCE' as RoomStatus, // Phòng đang bảo trì
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Hồ bơi', 'Thang máy'],
        images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Phòng Trọ KTX Tư Nhân Hiện Đại Gần Đại Học Quốc Gia TPHCM',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng trọ mô hình KTX tư nhân cao cấp gần Làng Đại học Quốc gia Thủ Đức. Giường tầng riêng tư có rèm che, bàn học thông minh, tủ locker khóa số bảo mật và điều hòa 24/7.',
        address: 'Đường Song Hành, Khu phố 6, Linh Trung',
        district: 'Thủ Đức',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 1800000,
        area: 24,
        maxPeople: 4,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Giường', 'Tủ quần áo', 'Bảo vệ 24/7', 'Máy sấy quần áo', 'Khu sinh hoạt chung'],
        images: ['https://images.unsplash.com/photo-1555854816-6be0f300f8b1?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Căn Hộ Mini Gần Đại Học Bách Khoa Đà Nẵng',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ mini khép kín, thiết kế tối giản thông minh đầy đủ tiện nghi cho sinh viên Bách Khoa và Sư Phạm Đà Nẵng. Có gác lửng rộng rãi, lối đi riêng không chung chủ.',
        address: '54 Đường Ngô Sĩ Liên',
        district: 'Quận Liên Chiểu',
        city: 'Đà Nẵng',
        pricePerMonth: 3200000,
        area: 22,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Tủ lạnh', 'Giường', 'Gác lửng', 'Chỗ để xe'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Phòng Đơn Giá Rẻ Cho Sinh Viên Gần Đại Học Y Hà Nội',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng đơn giá rẻ cực kỳ yên tĩnh cho sinh viên ôn thi Y Hà Nội. Gần chợ, trạm xe buýt và các bệnh viện lớn. Không chung chủ, giờ giấc tự do.',
        address: '10 Hẻm 22/8 Đường Tôn Thất Tùng',
        district: 'Quận Đống Đa',
        city: 'Hà Nội',
        pricePerMonth: 2500000,
        area: 15,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Quạt điện', 'Giường', 'Tủ quần áo', 'Chỗ phơi đồ'],
        images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Phòng Trọ Đôi Đầy Đủ Tiện Nghi Gần Đại Học Ngoại Thương TPHCM',
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng trọ rộng rãi phù hợp cho nhóm 2 bạn sinh viên Ngoại Thương hoặc Giao Thông Vận Tải ở ghép. Có ban công thoáng mát đón gió tự nhiên, khu vực nấu ăn riêng biệt.',
        address: '86 Đường D5, Phường 25',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 4500000,
        area: 28,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Ban công', 'Tủ quần áo'],
        images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Studio Gác Lửng Gần Đại Học Kinh Tế Quốc Dân (NEU)',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ dịch vụ mini thiết kế sang xịn mịn gần NEU, Bách Khoa, Xây Dựng. Có cửa sổ lớn, gác lửng cao không đụng đầu, khóa vân tay an toàn tuyệt đối.',
        address: '15 Ngõ 195 Đường Trần Đại Nghĩa',
        district: 'Quận Hai Bà Trưng',
        city: 'Hà Nội',
        pricePerMonth: 5500000,
        area: 25,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Tủ lạnh', 'Máy giặt', 'Smart TV', 'Khóa vân tay'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'],
        isFeatured: true,
      },
      {
        name: 'Nhà Nguyên Căn Cho Nhóm Sinh Viên Gần Đại Học Cần Thơ',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Nhà nguyên căn 1 trệt 1 lầu sạch sẽ, sân trước rộng rãi phù hợp cho nhóm sinh viên Đại học Cần Thơ ở chung để tiết kiệm chi phí. Khu dân cư an ninh, yên tĩnh học tập.',
        address: '120 Đường 3 Tháng 2',
        district: 'Quận Ninh Kiều',
        city: 'Cần Thơ',
        pricePerMonth: 9000000,
        area: 90,
        maxPeople: 6,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Bếp', 'Máy giặt', 'Chỗ để xe', 'Tủ lạnh', 'Sân rộng'],
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'],
        isFeatured: false,
      },
    ];


    console.log('Seeding rooms...');
    for (const room of roomsData) {
      const slug = makeSlug(room.name);
      await Room.create({
        ...room,
        slug,
        createdBy: adminUser._id,
      });
    }

    const totalRooms = await Room.countDocuments();
    console.log(`Database seeded successfully! Total rooms: ${totalRooms}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    console.log('Disconnecting from database...');
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

seedDatabase();
