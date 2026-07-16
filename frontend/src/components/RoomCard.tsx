
import { Link } from 'react-router-dom';
import { MapPin, Users, Maximize, Building } from 'lucide-react';

export interface RoomData {
  _id: string;
  name: string;
  slug: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'APARTMENT' | 'WHOLE_HOUSE';
  description: string;
  address: string;
  district: string;
  city: string;
  pricePerMonth: number;
  area: number;
  maxPeople: number;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'HIDDEN';
  amenities: string[];
  images: string[];
  isFeatured: boolean;
}

interface RoomCardProps {
  room: RoomData;
}

const HUMAN_ROOM_TYPES: Record<string, string> = {
  SINGLE: 'Phòng đơn',
  DOUBLE: 'Phòng đôi',
  STUDIO: 'Căn hộ Studio',
  APARTMENT: 'Căn hộ',
  WHOLE_HOUSE: 'Nhà nguyên căn',
};

const HUMAN_STATUSES: Record<string, string> = {
  AVAILABLE: 'Còn trống',
  RENTED: 'Đã thuê',
  MAINTENANCE: 'Bảo trì',
  HIDDEN: 'Tạm ẩn',
};

export const RoomCard = ({ room }: RoomCardProps) => {
  const coverImage = room.images && room.images.length > 0
    ? room.images[0]
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'; // Default placeholder

  const statusColors = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-500/5',
    RENTED: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-sm shadow-rose-500/5',
    MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-sm shadow-amber-500/5',
    HIDDEN: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 flex-shrink-0">
        <img
          src={coverImage}
          alt={room.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Status Badge */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${
            statusColors[room.status]
          }`}
        >
          {HUMAN_STATUSES[room.status] || room.status}
        </span>
        {/* Featured Tag */}
        {room.isFeatured && (
          <span className="absolute top-4 right-4 bg-brand-navy-950 text-brand-teal-400 border border-brand-navy-800/50 px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Nổi bật
          </span>
        )}
      </div>

      {/* Info Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Type & Size */}
        <div className="flex items-center gap-1.5 text-xs text-brand-teal-600 font-bold uppercase tracking-wider mb-2">
          <Building className="w-3.5 h-3.5" />
          <span>{HUMAN_ROOM_TYPES[room.roomType] || room.roomType}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-brand-navy-900 line-clamp-1 mb-2 group-hover:text-brand-teal-600 transition-colors">
          <Link to={`/rooms/${room.slug}`}>{room.name}</Link>
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4 line-clamp-1">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span>{`${room.address}, ${room.district}, ${room.city}`}</span>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-5 pt-3 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4 text-gray-400" />
            <span>{room.area} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span>Tối đa {room.maxPeople} người</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
          <div>
            <span className="text-2xl font-black text-brand-navy-950">${room.pricePerMonth}</span>
            <span className="text-xs text-gray-400 font-bold"> / tháng</span>
          </div>
          <Link
            to={`/rooms/${room.slug}`}
            className="bg-brand-navy-950 text-white hover:bg-brand-teal-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-brand-navy-950/10 hover:shadow-brand-teal-600/25 hover:scale-105 active:scale-95"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};
