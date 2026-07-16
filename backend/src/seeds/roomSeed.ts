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
        description: 'Phòng đôi sang trọng, mát mẻ nằm ngay cạnh bãi biển Mỹ Khê tuyệt đẹp. Chỉ mất chưa đầy 5 phút đi bộ ra bãi cát trắng và làn nước biển mát lạnh. Phòng được thiết kế theo phong cách tối giản Bắc Âu, trang bị 2 giường đơn hoặc 1 giường đôi lớn, ban công đón gió biển lồng lộng, tủ lạnh mini và phòng tắm riêng rộng rãi. Thích hợp cho sinh viên, khách du lịch dài ngày muốn tìm không gian nghỉ dưỡng học tập lý tưởng.',
        address: '78 Đường Võ Nguyên Giáp',
        district: 'Quận Ngũ Hành Sơn',
        city: 'Đà Nẵng',
        pricePerMonth: 8000000,
        area: 25,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Ban công', 'View biển'],
        images: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Nhà Nguyên Căn 3 Tầng Quận 3',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Nhà nguyên căn 3 tầng kiên cố nằm trên con phố sầm uất thuộc Quận 3, trung tâm hành chính TP.HCM. Tầng trệt rộng rãi cực kỳ thích hợp làm văn phòng công ty, cửa hàng hoặc không gian kinh doanh. Các tầng trên gồm 3 phòng ngủ đầy đủ tiện nghi, bếp ăn gia đình hiện đại, sân vườn tiểu cảnh mát mẻ và sân thượng view landmark. Nằm trong khu vực an ninh tuyệt đối, giao thông thuận tiện di chuyển sang các quận lân cận.',
        address: '220 Đường Điện Biên Phủ',
        district: 'Quận 3',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 60000000,
        area: 180,
        maxPeople: 8,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Sân vườn', 'Ga-ra', 'Sân thượng'],
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Studio View Hồ Tây Đường Xuân Diệu',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio nghệ thuật nằm trên đường Xuân Diệu có cửa sổ và ban công lớn hướng thẳng ra Hồ Tây thơ mộng. Phòng có sẵn bếp mini tiện nghi, tủ lạnh, lò vi sóng, giường nệm cao su non êm ái. Khu vực sinh sống yên tĩnh, cộng đồng cư dân quốc tế văn minh, thân thiện với vật nuôi. Thích hợp cho những ai tìm kiếm một không gian sống yên bình, lãng mạn giữa lòng thủ đô.',
        address: '12 Đường Xuân Diệu',
        district: 'Quận Tây Hồ',
        city: 'Hà Nội',
        pricePerMonth: 12000000,
        area: 40,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'View hồ', 'Thân thiện vật nuôi', 'Ban công'],
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Phòng Đơn Giá Rẻ Quận 10',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng trọ đơn giá cực tốt nằm trong hẻm an ninh, yên tĩnh trên đường Cách Mạng Tháng Tám Quận 10. Gần sát các trạm xe buýt, trường đại học lớn như Bách Khoa TP.HCM, đại học HUFLIT. Trang bị sẵn giường ngủ cá nhân, quạt máy, tủ đồ mini và khu vực phơi quần áo có ánh nắng trực tiếp. Hệ thống khóa cổng vân tay và camera giám sát 24/24 đảm bảo an ninh tuyệt đối.',
        address: '512 Đường Cách Mạng Tháng Tám',
        district: 'Quận 10',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 4000000,
        area: 16,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Giường', 'Tủ quần áo', 'Quạt điện'],
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Penthouse Hạng Sang View Cầu Rồng Đà Nẵng',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ Penthouse thông tầng siêu sang trọng tại tòa nhà Indochina Riverside Bạch Đằng. Thiết kế kính tràn sát trần mở ra tầm nhìn Panorama ngoạn mục ngắm trọn Cầu Rồng và sông Hàn lấp lánh về đêm. Phòng tắm trang bị bồn Jacuzzi massage cao cấp, nội thất bếp đảo tiêu chuẩn châu Âu, phòng khách siêu rộng và hệ thống Smart Home điều khiển tự động toàn diện.',
        address: 'Tòa Indochina Riverside, 74 Đường Bạch Đằng',
        district: 'Quận Hải Châu',
        city: 'Đà Nẵng',
        pricePerMonth: 42000000,
        area: 120,
        maxPeople: 4,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Hồ bơi', 'Phòng gym', 'View sông', 'Jacuzzi'],
        images: [
          'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Phòng Đôi Ấm Cúng Đường Duy Tân Cầu Giấy',
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng đôi rộng rãi trang bị sẵn 2 giường đơn hoặc giường đôi lớn cùng bàn học đôi hoàn hảo cho nhóm bạn sinh viên ở ghép tại khu vực Cầu Giấy. Gần các tòa nhà văn phòng Duy Tân, các trường đại học lớn như ĐHQGHN, ĐH Sư Phạm. Hệ thống khóa vân tay riêng tư, giờ giấc tự do không chung chủ, có dịch vụ dọn vệ sinh hành lang chung sạch sẽ định kỳ.',
        address: '15 Đường Duy Tân',
        district: 'Quận Cầu Giấy',
        city: 'Hà Nội',
        pricePerMonth: 6500000,
        area: 22,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Tủ lạnh', 'Tủ quần áo', 'Khóa vân tay'],
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Studio Phong Cách Bắc Âu Bình Thạnh',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio ấm áp lấy cảm hứng từ phong cách nội thất Scandinavian tối giản nhưng đầy đủ công năng tại đường Nguyễn Gia Trí (D2 cũ) Bình Thạnh. Khu vực sầm uất bậc nhất với vô vàn quán ăn ngon, tiệm cà phê sách phục vụ sinh viên. Phòng có gác lửng rộng, máy lạnh mát rượi, tủ lạnh riêng và ban công thoáng mát.',
        address: '88 Đường Nguyễn Gia Trí',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 10000000,
        area: 28,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Sân thượng'],
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Gia Đình Vinhomes Bình Thạnh',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ 2 phòng ngủ cao cấp tọa lạc tại khu đô thị hiện đại Vinhomes Central Park Bình Thạnh. Không gian sống đẳng cấp với đầy đủ nội thất thông minh, máy giặt, máy sấy quần áo. Thừa hưởng trọn vẹn các tiện ích cao cấp như công viên ven sông 14ha, hồ bơi ngoài trời miễn phí, phòng gym cao cấp, an ninh bảo vệ chuyên nghiệp trực ban 24/7.',
        address: 'Park 6, 208 Đường Nguyễn Hữu Cảnh',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 25000000,
        area: 82,
        maxPeople: 5,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Tủ lạnh', 'Hồ bơi', 'Phòng gym', 'Công viên', 'Nhà thông minh'],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Nhà Kiểu Pháp Có Lò Sưởi Tại Đà Lạt',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Biệt thự sân vườn kiểu Pháp cổ điển, lãng mạn giữa lòng thành phố ngàn hoa Đà Lạt. Ngôi nhà có lò sưởi ấm cúng bằng củi gỗ thật, vườn hoa cẩm tú cầu nở rộ quanh năm và sân thượng lộng gió ngắm đồi thông xanh mướt. Thích hợp cho kỳ nghỉ dưỡng yên bình của gia đình hoặc nhóm bạn muốn trải nghiệm không khí se lạnh thơ mộng.',
        address: '14 Đường Lê Hồng Phong',
        district: 'Phường 4',
        city: 'Đà Lạt',
        pricePerMonth: 20000000,
        area: 150,
        maxPeople: 6,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Bếp', 'Máy giặt', 'Lò sưởi', 'Sân vườn', 'View núi'],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Studio Mini Quận 4 Gần Cầu Khánh Hội',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio mini ấm cúng, thiết kế thông minh nhằm tối ưu hóa diện tích sử dụng tại Quận 4. Nằm ở vị trí cực kỳ đắc địa, chỉ mất 3 phút lái xe qua cầu Khánh Hội là kết nối trực tiếp đến trung tâm tài chính Quận 1. Được trang bị điều hòa máy lạnh êm ái, tủ lạnh mini, bếp nấu ăn cá nhân và phòng tắm sạch sẽ khép kín.',
        address: '320 Đường Đoàn Văn Bơ',
        district: 'Quận 4',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 7000000,
        area: 20,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp nhỏ', 'Tủ lạnh'],
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Phòng Đơn Homestay Sôi Động Nha Trang',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng ngủ đơn trẻ trung, tràn đầy năng lượng nằm trong khu tổ hợp Homestay du lịch tại trung tâm Nha Trang. Homestay tích hợp quầy bar sinh hoạt chung sôi động, bàn bida giải trí miễn phí và khu vực nướng BBQ ngoài trời mát mẻ. Thích hợp cho các bạn trẻ thích giao lưu kết nối bạn bè bốn phương khi ghé thăm thành phố biển.',
        address: '12 Đường Hùng Vương',
        district: 'Phường Lộc Thọ',
        city: 'Nha Trang',
        pricePerMonth: 3000000,
        area: 12,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bàn bida', 'Nướng BBQ', 'Thuê xe đạp'],
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Studio Sang Trọng Trung Tâm Hoàn Kiếm',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio khép kín được thiết kế tỉ mỉ kết hợp hài hòa nét cổ kính của Hà Nội xưa và các tiện nghi hiện đại ngay giữa lòng Phố Cổ Hoàn Kiếm. Nằm trên con phố lịch sử Hàng Bạc, chỉ vài bước chân là ra tới Hồ Gươm xanh mát. Ban công trồng hoa xinh xắn ngắm phố phường cổ kính, không khí yên bình, nhẹ nhàng.',
        address: '15 Đường Hàng Bạc',
        district: 'Quận Hoàn Kiếm',
        city: 'Hà Nội',
        pricePerMonth: 13000000,
        area: 35,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Ban công cổ điển'],
        images: [
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Biệt Thự 3 Phòng Ngủ View Biển Vũng Tàu',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Biệt thự nghỉ dưỡng cao cấp 3 phòng ngủ rộng lớn sát bờ biển Vũng Tàu. Biệt thự sở hữu hồ bơi ngoài trời riêng tư mát lạnh, sân vườn rộng rãi tổ chức tiệc nướng BBQ gia đình ấm cúng và bãi đỗ xe ô tô thoải mái. Không gian nghỉ dưỡng yên tĩnh, đón trọn làn gió biển mát lành thổi vào mát mẻ cả ngày đêm.',
        address: '25 Đường Trần Phú',
        district: 'Phường 5',
        city: 'Vũng Tàu',
        pricePerMonth: 70000000,
        area: 350,
        maxPeople: 12,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Hồ bơi', 'Nướng BBQ', 'View biển', 'Ga-ra'],
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Bungalow Núi View Ruộng Bậc Thang Sapa',
        roomType: 'SINGLE' as RoomType,
        description: 'Bungalow nhà gỗ truyền thống ấm cúng nằm giữa thung lũng bản Tả Van Sapa. Từ ban công riêng có tầm nhìn Panorama tuyệt đẹp hướng thẳng ra những thửa ruộng bậc thang trùng điệp ngập tràn mây trắng và sương mù lãng đãng mỗi sớm mai. Trải nghiệm tuyệt vời để khám phá văn hóa ẩm thực và đời sống dân dã bản địa.',
        address: 'Bản Tả Van',
        district: 'Sa Pa',
        city: 'Lào Cai',
        pricePerMonth: 5000000,
        area: 20,
        maxPeople: 2,
        status: 'HIDDEN' as RoomStatus, // Phòng ẩn để kiểm tra quyền admin
        amenities: ['Wifi', 'Máy sưởi', 'Ban công', 'View núi', 'Bữa sáng'],
        images: [
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Đang Bảo Trì Phú Mỹ Hưng Quận 7',
        roomType: 'APARTMENT' as RoomType,
        description: 'Căn hộ chung cư cao cấp nằm trong quần thể đô thị hiện đại Phú Mỹ Hưng Quận 7. Hiện tại căn hộ đang được ban quản lý tiến hành bảo trì, nâng cấp toàn diện hệ thống phòng cháy chữa cháy, điều hòa và nội thất định kỳ để mang lại chất lượng phục vụ an toàn và tốt nhất. Dự kiến sẽ sớm mở lại phục vụ cư dân thuê trong tháng tới.',
        address: '105 Đại Lộ Nguyễn Lương Bằng',
        district: 'Quận 7',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 18000000,
        area: 68,
        maxPeople: 3,
        status: 'MAINTENANCE' as RoomStatus, // Phòng đang bảo trì
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Hồ bơi', 'Thang máy'],
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Phòng Trọ KTX Tư Nhân Hiện Đại Gần Đại Học Quốc Gia TPHCM',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng trọ mô hình KTX tư nhân cao cấp nằm ngay cạnh Làng Đại học Quốc gia Thủ Đức, giải pháp chỗ ở tuyệt vời cho sinh viên. Thiết kế giường tầng riêng tư có rèm che dày dặn, bàn học thông minh cá nhân, tủ locker đựng đồ khóa số bảo mật an toàn. Điều hòa máy lạnh mát mẻ 24/7 và hệ thống máy giặt sấy sấy khô tiện lợi.',
        address: 'Đường Song Hành, Khu phố 6, Linh Trung',
        district: 'Thủ Đức',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 1800000,
        area: 24,
        maxPeople: 4,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Giường', 'Tủ quần áo', 'Bảo vệ 24/7', 'Máy sấy quần áo', 'Khu sinh hoạt chung'],
        images: [
          'https://images.unsplash.com/photo-1555854816-6be0f300f8b1?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Căn Hộ Mini Gần Đại Học Bách Khoa Đà Nẵng',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ mini khép kín, thiết kế tối giản thông minh đầy đủ tiện nghi ngay sát cổng trường Đại học Bách Khoa và Đại học Sư Phạm Đà Nẵng. Có gác lửng ngủ rộng rãi cao không đụng đầu, bếp nấu ăn riêng tư, lối đi riêng tự do hoàn toàn không chung chủ. Khu vực yên tĩnh, dân cư thân thiện và an ninh cực kỳ tốt.',
        address: '54 Đường Ngô Sĩ Liên',
        district: 'Quận Liên Chiểu',
        city: 'Đà Nẵng',
        pricePerMonth: 3200000,
        area: 22,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Tủ lạnh', 'Giường', 'Gác lửng', 'Chỗ để xe'],
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Phòng Đơn Giá Rẻ Cho Sinh Viên Gần Đại Học Y Hà Nội',
        roomType: 'SINGLE' as RoomType,
        description: 'Phòng trọ đơn giá siêu rẻ nằm trong ngõ yên tĩnh tuyệt đối ngay đường Tôn Thất Tùng, cực kỳ thích hợp cho các bạn sinh viên y khoa ôn thi mệt mỏi. Gần sát bệnh viện Đại học Y, các khu chợ dân sinh thực phẩm tươi ngon giá rẻ. Không gian yên tĩnh học tập, giờ giấc ra vào tự do, không chung đụng chủ nhà.',
        address: '10 Hẻm 22/8 Đường Tôn Thất Tùng',
        district: 'Quận Đống Đa',
        city: 'Hà Nội',
        pricePerMonth: 2500000,
        area: 15,
        maxPeople: 1,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Quạt điện', 'Giường', 'Tủ quần áo', 'Chỗ phơi đồ'],
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Phòng Trọ Đôi Đầy Đủ Tiện Nghi Gần Đại Học Ngoại Thương TPHCM',
        roomType: 'DOUBLE' as RoomType,
        description: 'Phòng trọ đôi rộng rãi, ban công lớn đón gió tự nhiên nằm tại trung tâm Bình Thạnh, gần các trường đại học Ngoại Thương, Giao thông Vận tải và HUTECH. Phòng được trang bị sẵn điều hòa Inverter thế hệ mới, bếp nấu ăn sạch sẽ và máy giặt hiện đại. Phù hợp cho nhóm 2-3 bạn ở ghép cùng chia sẻ chi phí.',
        address: '86 Đường D5, Phường 25',
        district: 'Quận Bình Thạnh',
        city: 'Thành phố Hồ Chí Minh',
        pricePerMonth: 4500000,
        area: 28,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Máy giặt', 'Ban công', 'Tủ quần áo'],
        images: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
      {
        name: 'Căn Hộ Studio Gác Lửng Gần Đại Học Kinh Tế Quốc Dân (NEU)',
        roomType: 'STUDIO' as RoomType,
        description: 'Căn hộ studio dịch vụ mini khép kín cực kỳ sang trọng nằm trên đường Trần Đại Nghĩa, vị trí trung tâm sát vách các trường NEU, Bách Khoa và Xây Dựng. Có gác lửng ngủ ấm cúng rộng rãi, tủ quần áo lớn, tủ lạnh gia đình và bếp từ âm. Hệ thống an ninh thông minh mở bằng khóa vân tay bảo mật an toàn tuyệt đối.',
        address: '15 Ngõ 195 Đường Trần Đại Nghĩa',
        district: 'Quận Hai Bà Trưng',
        city: 'Hà Nội',
        pricePerMonth: 5500000,
        area: 25,
        maxPeople: 2,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Điều hòa', 'Bếp', 'Tủ lạnh', 'Máy giặt', 'Smart TV', 'Khóa vân tay'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: true,
      },
      {
        name: 'Nhà Nguyên Căn Cho Nhóm Sinh Viên Gần Đại Học Cần Thơ',
        roomType: 'WHOLE_HOUSE' as RoomType,
        description: 'Nhà nguyên căn 1 trệt 1 lầu sạch sẽ, sân trước đậu xe rộng rãi trên đường 3 Tháng 2, cách trường Đại học Cần Thơ chỉ vài phút đi xe. Thiết kế gồm 3 phòng ngủ thoáng mát, bếp ăn rộng, trang bị sẵn tủ lạnh, máy giặt. Rất thích hợp cho một nhóm bạn sinh viên ở ghép cùng học tập và chia sẻ chi phí sinh hoạt.',
        address: '120 Đường 3 Tháng 2',
        district: 'Quận Ninh Kiều',
        city: 'Cần Thơ',
        pricePerMonth: 9000000,
        area: 90,
        maxPeople: 6,
        status: 'AVAILABLE' as RoomStatus,
        amenities: ['Wifi', 'Bếp', 'Máy giặt', 'Chỗ để xe', 'Tủ lạnh', 'Sân rộng'],
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600'
        ],
        isFeatured: false,
      },
    ];


    const SAMPLE_REVIEWS = [
      { tenantName: 'Nguyễn Minh Hoàng', rating: 5, comment: 'Phòng sạch sẽ, chủ nhà cực kỳ thân thiện và hỗ trợ nhiệt tình. Vị trí rất tiện đi lại.' },
      { tenantName: 'Lê Thị Mai Chi', rating: 5, comment: 'Phòng đầy đủ tiện nghi đúng như mô tả, không khí thoáng đãng, an ninh tốt.' },
      { tenantName: 'Trần Minh Đức', rating: 5, comment: 'Phòng đẹp, nội thất mới. Giá hơi cao một chút nhưng cực kỳ đáng tiền.' },
      { tenantName: 'Phạm Thanh Thảo', rating: 5, comment: 'Mọi thứ tuyệt vời! Mình ở đây gần 1 năm rồi và chưa có điểm gì để chê.' },
      { tenantName: 'Hoàng Anh Tuấn', rating: 5, comment: 'Vị trí đắc địa gần sát trường học của mình, đi bộ đi học rất tiện. Highly recommend!' },
      { tenantName: 'Vũ Hải Yến', rating: 5, comment: 'Phòng khép kín sạch sẽ, khu vực chung được dọn dẹp hàng tuần. Rất hài lòng.' },
      { tenantName: 'Đặng Quốc Bảo', rating: 5, comment: 'Hệ thống an ninh khoá vân tay cực kỳ an tâm. Chủ nhà tạo mọi điều kiện thuận lợi.' },
      { tenantName: 'Bùi Phương Linh', rating: 5, comment: 'Gác lửng cao ráo không bị đụng đầu, bếp nấu ăn thoáng không bị ám mùi. Đáng giá 5 sao!' }
    ];

    console.log('Seeding rooms...');
    for (const room of roomsData) {
      const slug = makeSlug(room.name);
      
      // Randomly pick 2-3 reviews
      const numReviews = Math.floor(Math.random() * 2) + 2;
      const shuffled = [...SAMPLE_REVIEWS].sort(() => 0.5 - Math.random());
      const selectedReviews = shuffled.slice(0, numReviews).map(r => ({
        ...r,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      }));

      const totalRating = selectedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = Math.round((totalRating / selectedReviews.length) * 10) / 10;

      await Room.create({
        ...room,
        slug,
        createdBy: adminUser._id,
        reviews: selectedReviews,
        rating: averageRating
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
