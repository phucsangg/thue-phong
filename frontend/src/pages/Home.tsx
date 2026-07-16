import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomService } from '../services/roomService';
import { RoomCard } from '../components/RoomCard';
import type { RoomData } from '../components/RoomCard';
import { CardSkeleton } from '../components/Skeleton';
import { Search, MapPin, Sparkles, Shield, Heart } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  // Fetch featured rooms
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featuredRooms'],
    queryFn: async () => {
      const response = await roomService.getFeaturedRooms();
      return response.data?.rooms as RoomData[];
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/rooms?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/rooms');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-brand-navy-950 text-white overflow-hidden py-32 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        {/* Ambient Moving Blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-teal-500/20 rounded-full filter blur-[100px] animate-ambient-1 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[120px] animate-ambient-2 pointer-events-none"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-75"></div>

        <div className="relative max-w-4xl mx-auto z-10 space-y-8">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-xs font-bold uppercase tracking-wider text-brand-teal-400">
            <Sparkles className="w-3.5 h-3.5" />
            Tìm kiếm Tổ ấm Mơ ước
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
            Khám phá Sự Tiện nghi &amp; Thoải mái cùng <span className="bg-gradient-to-r from-brand-teal-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">RentNow</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-350 max-w-2xl mx-auto font-medium font-inter">
            Nền tảng cho thuê phòng cao cấp cung cấp các căn hộ studio, căn hộ chung cư và phòng đơn được tuyển chọn kỹ lưỡng.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto p-2 bg-brand-navy-900/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl focus-within:border-brand-teal-500/40 transition-all duration-300"
          >
            <div className="flex-grow relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Tìm kiếm theo thành phố, quận hoặc từ khóa..."
                className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 text-white placeholder-slate-450 focus:outline-none focus:ring-0 text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-brand-teal-500 to-emerald-500 hover:from-brand-teal-600 hover:to-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all text-sm shadow-md shadow-brand-teal-500/20 hover:scale-105 active:scale-95"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-brand-navy-950 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{num:'500+', label:'Phòng trống'},{num:'1,200+', label:'Khách hài lòng'},{num:'50+', label:'Quận / Tỉnh thành'},{num:'4.9★', label:'Đánh giá TB'}].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-brand-teal-400">{s.num}</p>
              <p className="text-sm text-slate-400 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-brand-navy-950 tracking-tight">Tại sao chọn RentNow?</h2>
          <p className="text-gray-500 font-semibold text-sm mt-2">Nền tảng được tin dùng bởi hàng nghìn người thuê phòng trên toàn quốc.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-brand-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-navy-950 text-base mb-2">Thanh toán An toàn</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Giao dịch trực tiếp, các điều khoản đã được xác thực và quản lý hợp đồng minh bạch.
              </p>
            </div>
          </div>
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-navy-950 text-base mb-2">Vị trí Đắc địa</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Các phòng nằm gần trường đại học, khu thương mại sầm uất và các bãi biển.
              </p>
            </div>
          </div>
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-brand-navy-950 text-base mb-2">Thoải mái Tối đa</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Phòng được phân loại rõ ràng theo nhu cầu của bạn với thông tin chi tiết chính xác.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-teal-600 mb-2">✦ Được tuyển chọn</span>
            <h2 className="text-3xl font-black text-brand-navy-950 tracking-tight">Tổ ấm nổi bật</h2>
            <p className="text-sm text-gray-500 font-semibold mt-1">
              Các phòng tuyển chọn hàng đầu, đáp ứng đầy đủ tiêu chí tiện nghi và giá tốt.
            </p>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-brand-navy-950 hover:bg-brand-teal-600 px-4 py-2.5 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
          >
            Xem tất cả phòng
            <span>→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 bg-rose-50 rounded-2xl border border-rose-150 text-rose-800 text-sm font-semibold">
            Không thể tải danh sách phòng nổi bật. Vui lòng thử lại sau.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            Hiện tại chưa có phòng nổi bật nào được đăng tải.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
