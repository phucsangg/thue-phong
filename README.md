# 🏠 RentNow — Nền Tảng Thuê Phòng Trực Tuyến

> Ứng dụng web full-stack giúp người dùng tìm kiếm, lọc và đặt thuê phòng trực tuyến với giao diện hiện đại, bảo mật cao.

[![CI Pipeline](https://github.com/phucsangg/thue-phong/actions/workflows/ci.yml/badge.svg)](https://github.com/phucsangg/thue-phong/actions/workflows/ci.yml)

---

## 📋 Mục Lục

- [Ý tưởng hệ thống](#-ý-tưởng-hệ-thống)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [ERD — Sơ đồ quan hệ dữ liệu](#-erd--sơ-đồ-quan-hệ-dữ-liệu)
- [Use Case](#-use-case)
- [Tính năng chính](#-tính-năng-chính)
- [Stack công nghệ](#-stack-công-nghệ)
- [Bảo mật](#-bảo-mật)
- [Cài đặt & Chạy local](#-cài-đặt--chạy-local)
- [API Endpoints](#-api-endpoints)
- [Tài khoản mẫu](#-tài-khoản-mẫu)

---

## 💡 Ý Tưởng Hệ Thống

**RentNow** là nền tảng kết nối chủ nhà và người thuê phòng. Người dùng có thể:
- Duyệt danh sách phòng với bộ lọc nâng cao (thành phố, loại phòng, giá, diện tích, tiện ích)
- Xem chi tiết phòng (ảnh, mô tả, vị trí, tiện ích, thông tin chủ nhà)
- Gửi yêu cầu thuê và theo dõi trạng thái
- Quản lý hồ sơ cá nhân

**Admin** có thể:
- Quản lý toàn bộ phòng (CRUD, thay đổi trạng thái)
- Duyệt / từ chối yêu cầu thuê
- Xem dashboard thống kê

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT LAYER                     │
│          React + TypeScript (Vite) + Tailwind        │
│    Pages: Home | Rooms | RoomDetails | Profile       │
│            Login | Register | Admin Panel            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST (JSON)
                       │ JWT Bearer Token
┌──────────────────────▼──────────────────────────────┐
│                    API LAYER (Backend)               │
│              Node.js + Express + TypeScript          │
│                                                      │
│  Middlewares: Helmet | CORS | RateLimit | HPP        │
│               Morgan (logging) | Auth (JWT)          │
│                                                      │
│  Routes:  /auth  /rooms  /rental-requests           │
│            /users  /admin/dashboard                 │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                  DATABASE LAYER                      │
│              MongoDB Atlas (Cloud)                   │
│  Collections: users | rooms | refreshtokens          │
│               rentalrequests                        │
└─────────────────────────────────────────────────────┘
```

### Luồng hoạt động chính

```
Người dùng → Tìm kiếm phòng → Xem chi tiết → Đăng nhập
           → Gửi yêu cầu thuê → Admin duyệt → Thông báo
```

---

## 📊 ERD — Sơ Đồ Quan Hệ Dữ Liệu

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Room        │
├─────────────────┤         ├─────────────────┤
│ _id (ObjectId)  │◄────┐   │ _id (ObjectId)  │
│ name            │     │   │ name            │
│ email (unique)  │     │   │ slug (unique)   │
│ passwordHash    │     │   │ roomType        │
│ phone           │     │   │ description     │
│ avatar          │     │   │ address         │
│ gender          │     │   │ district        │
│ dateOfBirth     │     │   │ city            │
│ address         │     │   │ pricePerMonth   │
│ bio             │     │   │ area            │
│ role            │     │   │ maxPeople       │
│ isVerified      │     │   │ amenities[]     │
│ resetPwdToken   │     └───│ createdBy (ref) │
│ resetPwdExpire  │         │ images[]        │
│ createdAt       │         │ status          │
└────────┬────────┘         │ isFeatured      │
         │                  │ createdAt       │
         │                  └────────┬────────┘
         │                           │
         │    ┌──────────────────────┴──────────┐
         │    │       RentalRequest              │
         │    ├─────────────────────────────────┤
         └────│ tenant (ref → User)              │
              │ room   (ref → Room)              │
              │ status (PENDING/APPROVED/DENIED) │
              │ message                          │
              │ adminNote                        │
              │ createdAt                        │
              └─────────────────────────────────┘

              ┌─────────────────────┐
              │    RefreshToken      │
              ├─────────────────────┤
              │ token               │
              │ user (ref → User)   │
              │ expiresAt           │
              └─────────────────────┘
```

---

## 👤 Use Case

### Người dùng chưa đăng nhập (Guest)
- Xem danh sách phòng, tìm kiếm, lọc
- Xem chi tiết phòng
- Đăng ký tài khoản
- Đăng nhập

### Người dùng đã đăng nhập (User)
- Tất cả quyền của Guest +
- Gửi yêu cầu thuê phòng
- Xem lịch sử yêu cầu của mình
- Quản lý hồ sơ cá nhân (ảnh đại diện, thông tin liên hệ, đổi mật khẩu)
- Quên mật khẩu / Reset mật khẩu qua email

### Quản trị viên (Admin)
- Tất cả quyền của User +
- Thêm / sửa / xoá phòng
- Thay đổi trạng thái phòng (Available / Rented / Maintenance / Hidden)
- Duyệt / từ chối yêu cầu thuê
- Xem dashboard thống kê (tổng phòng, yêu cầu, user, doanh thu)

---

## ✨ Tính Năng Chính

| Tính năng | Mô tả |
|---|---|
| 🔍 Tìm kiếm nâng cao | Tìm theo tên, thành phố, quận, địa chỉ |
| 🗂️ Lọc đa chiều | Lọc theo loại phòng, giá, diện tích, tiện ích, thành phố |
| 📄 Chi tiết phòng | Gallery ảnh, bản đồ, danh sách tiện ích, thông tin chủ nhà |
| 👤 Hồ sơ cá nhân | Ảnh đại diện, thông tin liên hệ, giới tính, ngày sinh, địa chỉ, giới thiệu |
| 🔐 Authentication | Đăng ký, đăng nhập, refresh token, đăng xuất, quên/reset mật khẩu |
| 📬 Yêu cầu thuê | Gửi, theo dõi trạng thái, lịch sử yêu cầu |
| 🛡️ Bảo vệ role | Route protection theo USER / ADMIN |
| 📊 Admin Dashboard | Thống kê tổng quan, quản lý phòng & yêu cầu |

---

## 🛠️ Stack Công Nghệ

### Frontend
- **React 19** + **TypeScript** — UI framework
- **Vite** — Build tool nhanh
- **Tailwind CSS** — Utility-first styling
- **TanStack Query** — Server state management & caching
- **React Router v7** — Client-side routing
- **Lucide React** — Icon library
- **Axios** — HTTP client

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB Atlas** + **Mongoose** — Cloud database
- **bcrypt** — Hash mật khẩu
- **jsonwebtoken** — JWT authentication
- **Helmet** — HTTP security headers
- **express-rate-limit** — Rate limiting
- **hpp** — HTTP Parameter Pollution protection
- **morgan** — Request logging
- **nodemailer** — Email service (forgot password)
- **Vitest** + **Supertest** — Testing

---

## 🔒 Bảo Mật

| Biện pháp | Chi tiết |
|---|---|
| **Hash mật khẩu** | bcrypt với 10 salt rounds |
| **JWT** | Access token 15 phút + Refresh token 7 ngày |
| **Helmet** | Bảo vệ HTTP headers (XSS, clickjacking, MIME sniffing) |
| **CORS** | Chỉ cho phép từ `FRONTEND_URL` |
| **Rate Limit** | 100 req / 15 phút / IP |
| **HPP** | Ngăn HTTP Parameter Pollution |
| **Payload Limit** | JSON body limit 10kb (chống DoS) |
| **SQL Injection** | MongoDB + Mongoose tự động escape |
| **Role-based Access** | Middleware kiểm tra role trên mỗi route |
| **Token Revocation** | Refresh token lưu DB, revoke khi logout |
| **Reset Token** | Hashed SHA-256, hết hạn sau 10 phút |

---

## 🚀 Cài Đặt & Chạy Local

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas account (hoặc local MongoDB)

### 1. Clone repo
```bash
git clone https://github.com/phucsangg/thue-phong.git
cd thue-phong
```

### 2. Cài đặt Backend
```bash
cd backend
npm install
cp .env.example .env
# Điền thông tin vào .env
npm run seed    # Nạp dữ liệu mẫu
npm run dev     # Chạy port 5000
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev     # Chạy port 5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/auth/register` | Đăng ký |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/logout` | Đăng xuất |
| POST | `/api/v1/auth/refresh-token` | Làm mới access token |
| POST | `/api/v1/auth/forgot-password` | Gửi email reset mật khẩu |
| POST | `/api/v1/auth/reset-password/:token` | Đặt lại mật khẩu |

### Rooms
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/rooms` | Danh sách phòng (search, filter, sort, paginate) |
| GET | `/api/v1/rooms/featured` | Phòng nổi bật |
| GET | `/api/v1/rooms/:slug` | Chi tiết phòng |
| POST | `/api/v1/rooms` | Tạo phòng mới (Admin) |
| PUT | `/api/v1/rooms/:id` | Cập nhật phòng (Admin) |
| DELETE | `/api/v1/rooms/:id` | Xoá phòng (Admin) |

### Rental Requests
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/rental-requests` | Gửi yêu cầu thuê |
| GET | `/api/v1/rental-requests/my` | Yêu cầu của tôi |
| GET | `/api/v1/rental-requests` | Tất cả yêu cầu (Admin) |
| PATCH | `/api/v1/rental-requests/:id/status` | Duyệt/từ chối (Admin) |

### Users
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/users/me` | Thông tin tôi |
| PUT | `/api/v1/users/me` | Cập nhật hồ sơ |
| PUT | `/api/v1/users/change-password` | Đổi mật khẩu |

---

## 🧪 Chạy Tests

```bash
cd backend
npm run test
```

---

## 🔑 Tài Khoản Mẫu

Sau khi chạy `npm run seed`:

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@rentnow.com` | `admin123` | Quản trị viên |
| `user@rentnow.com` | `user123` | Thành viên |

---

## 📁 Cấu Trúc Dự Án

```
thue-phong/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── validators/     # Input validation
│   │   ├── utils/          # JWT, email, errors
│   │   ├── seeds/          # Database seeder
│   │   ├── test/           # Test suites (Vitest)
│   │   └── app.ts          # Express app config
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/          # Route pages
    │   ├── components/     # Reusable components
    │   ├── api/            # API call functions
    │   ├── hooks/          # Custom React hooks
    │   └── context/        # Auth context
    └── package.json
```

---

## 📄 License

MIT © 2026 RentNow
