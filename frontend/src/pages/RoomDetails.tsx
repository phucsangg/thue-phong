import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { roomService } from '../services/roomService';
import { rentalService } from '../services/rentalService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Info, 
  Shield, 
  CheckCircle, 
  Mail, 
  Phone, 
  ChevronRight,
  Star
} from 'lucide-react';

const HUMAN_ROOM_TYPES: Record<string, string> = {
  SINGLE: 'Phòng đơn',
  DOUBLE: 'Phòng đôi',
  STUDIO: 'Căn hộ Studio',
  APARTMENT: 'Căn hộ chung cư',
  WHOLE_HOUSE: 'Nhà nguyên căn',
};

const DetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
    <div className="aspect-[21/9] bg-gray-200 rounded-3xl animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

export const RoomDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(6);
  const [message, setMessage] = useState('');
  const [activeImage, setActiveImage] = useState('');

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is missing');
      const res = await roomService.getRoomBySlug(slug);
      return res.data?.room;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (room?.images && room.images.length > 0) {
      setActiveImage(room.images[0]);
    }
  }, [room]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      return await rentalService.createRequest({
        room: room._id,
        startDate,
        durationMonths,
        message: message.trim() || undefined,
      });
    },
    onSuccess: (data: any) => {
      if (data?.status === 'success') {
        showToast('Gửi yêu cầu thuê phòng thành công!', 'success');
        navigate('/my-requests');
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gửi yêu cầu thuê phòng thất bại';
      showToast(msg, 'error');
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      showToast('Vui lòng chọn ngày bắt đầu thuê', 'info');
      return;
    }
    if (durationMonths < 1) {
      showToast('Thời hạn thuê tối thiểu là 1 tháng', 'info');
      return;
    }
    bookingMutation.mutate();
  };

  if (isLoading) return <DetailsSkeleton />;
  if (isError || !room) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-150 text-center rounded-3xl space-y-4">
        <Info className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-brand-navy-950">Không tìm thấy phòng</h2>
        <p className="text-sm text-gray-500">Căn phòng bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/rooms" className="inline-block bg-brand-navy-900 text-brand-teal-400 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-teal-600 hover:text-white transition-colors">
          Xem các phòng khác
        </Link>
      </div>
    );
  }

  const coverImage = room.images && room.images.length > 0
    ? room.images[0]
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200';

  const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-250',
    RENTED: 'bg-rose-50 text-rose-700 border-rose-250',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-250',
    HIDDEN: 'bg-gray-50 text-gray-700 border-gray-250',
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Còn trống',
    RENTED: 'Đã thuê',
    MAINTENANCE: 'Bảo trì',
    HIDDEN: 'Tạm ẩn',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <nav className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
        <Link to="/" className="hover:text-brand-teal-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3 h-3 text-gray-350" />
        <Link to="/rooms" className="hover:text-brand-teal-600 transition-colors">Danh sách phòng</Link>
        <ChevronRight className="w-3 h-3 text-gray-350" />
        <span className="text-brand-navy-950 truncate max-w-xs">{room.name}</span>
      </nav>

      <div className="space-y-4">
        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-gray-100 shadow-md">
          <img
            src={activeImage || coverImage}
            alt={room.name}
            className="object-cover w-full h-full transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-950/40 via-transparent to-transparent"></div>
        </div>
        
        {/* Thumbnails row */}
        {room.images && room.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto py-2 px-1">
            {room.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`h-16 w-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === img ? 'border-[#0072bc] scale-105 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[room.status]}`}>
                {statusLabels[room.status] || room.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-teal-50 border border-brand-teal-150 text-brand-teal-700">
                {HUMAN_ROOM_TYPES[room.roomType] || room.roomType}
              </span>
              {room.rating !== undefined && (
                <span className="flex items-center gap-1 text-xs font-bold bg-amber-50 border border-amber-250 text-amber-700 px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  {room.rating.toFixed(1)} / 5.0 ({room.reviews?.length || 0} đánh giá)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-brand-navy-950 tracking-tight leading-tight">
              {room.name}
            </h1>

            <div className="flex items-start gap-1.5 text-gray-500 font-medium">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{`${room.address}, ${room.district}, ${room.city}`}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-5 bg-white border border-gray-150 rounded-2xl shadow-sm text-center">
            <div className="space-y-1">
              <span className="block text-xs font-bold text-gray-450 uppercase tracking-wider">Giá thuê</span>
              <span className="block text-lg sm:text-xl font-black text-brand-navy-950">{room.pricePerMonth.toLocaleString('vi-VN')}đ/tháng</span>
            </div>
            <div className="space-y-1 border-x border-gray-100">
              <span className="block text-xs font-bold text-gray-450 uppercase tracking-wider">Diện tích</span>
              <span className="block text-lg sm:text-xl font-black text-brand-navy-950">{room.area} m²</span>
            </div>
            <div className="space-y-1">
              <span className="block text-xs font-bold text-gray-450 uppercase tracking-wider">Tối đa</span>
              <span className="block text-lg sm:text-xl font-black text-brand-navy-950">{room.maxPeople} người</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy-950">Mô tả chi tiết</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium font-inter">
              {room.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-brand-navy-950">Tiện ích căn phòng</h3>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <CheckCircle className="w-4 h-4 text-brand-teal-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-semibold">Chưa đăng ký tiện ích nào cho phòng này.</p>
            )}
          </div>

          {room.createdBy && (
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <h3 className="text-lg font-bold text-brand-navy-950">Người đăng tin</h3>
              <div className="flex items-center gap-4 bg-white border border-gray-150 p-4 rounded-2xl">
                <img
                  src={room.createdBy.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                  alt={room.createdBy.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-100"
                />
                <div>
                  <h4 className="font-bold text-brand-navy-950 text-sm">{room.createdBy.name}</h4>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {room.createdBy.email}
                    </span>
                    {room.createdBy.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {room.createdBy.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tenant Reviews Section */}
          <div className="border-t border-gray-100 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-navy-950 flex items-center gap-2">
                Đánh giá từ khách thuê
                {room.rating !== undefined && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ★ {room.rating.toFixed(1)}
                  </span>
                )}
              </h3>
              <span className="text-sm font-bold text-slate-400">
                {room.reviews?.length || 0} đánh giá
              </span>
            </div>

            {room.reviews && room.reviews.length > 0 ? (
              <div className="space-y-4">
                {room.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0072bc]/10 text-[#0072bc] flex items-center justify-center font-bold text-sm border border-[#0072bc]/20">
                          {rev.tenantName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-brand-navy-950">{rev.tenantName}</h4>
                          <span className="text-[10px] font-bold text-slate-400">Khách thuê thực tế</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-current text-amber-500' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium font-inter leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="text-[10px] font-bold text-slate-400 text-right">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-semibold text-sm">
                Chưa có đánh giá nào cho phòng này.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-black text-brand-navy-950">Đăng ký thuê phòng</h3>

            {room.status !== 'AVAILABLE' ? (
              <div className="bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-4 text-sm font-semibold flex items-start gap-2">
                <Info className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <span>Căn phòng này hiện tại {room.status === 'RENTED' ? 'đã có người thuê' : 'đang bảo trì'} và không thể nhận thêm yêu cầu thuê mới.</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                  Bạn quan tâm đến căn phòng này? Đăng nhập tài khoản để gửi yêu cầu thuê phòng trực tiếp đến chủ nhà.
                </p>
                <Link
                  to="/login"
                  className="block w-full text-center bg-brand-navy-900 hover:bg-brand-teal-600 text-brand-teal-400 hover:text-white border border-brand-navy-800 font-bold py-3 rounded-xl text-sm transition-all shadow-sm"
                >
                  Đăng nhập để đăng ký
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Ngày dọn vào
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Thời hạn thuê (Tháng)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={durationMonths}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDurationMonths(isNaN(val) ? 0 : val);
                    }}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Dynamic Price Breakdown */}
                {durationMonths > 0 && (
                  <div className="p-4 bg-brand-navy-950/5 border border-brand-navy-950/10 rounded-xl space-y-2 text-xs font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Đơn giá:</span>
                      <span>{room.pricePerMonth.toLocaleString('vi-VN')}đ / tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời hạn:</span>
                      <span>{durationMonths} tháng</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-gray-250 pt-2 font-bold text-brand-navy-950 text-sm">
                      <span>Tổng ước tính:</span>
                      <span className="text-brand-teal-600 font-black">{(room.pricePerMonth * durationMonths).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    Lời nhắn gửi chủ nhà
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Giới thiệu đôi nét về bản thân..."
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="w-full flex justify-center items-center py-3 bg-brand-navy-900 hover:bg-brand-teal-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Gửi yêu cầu thuê phòng'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-150 p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-brand-navy-950 text-xs uppercase tracking-wider flex items-center gap-1.5 text-gray-400">
              <Shield className="w-4 h-4 text-brand-teal-600" />
              Cam kết từ iSinhvien
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Tất cả các phòng được đăng tải đều qua kiểm duyệt thực tế. Nếu phòng không đúng thông tin khi nhận phòng, hãy liên hệ hỗ trợ 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
