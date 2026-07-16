import { Link } from 'react-router-dom';
import {
  Building,
  MapPin,
  Maximize,
  Users,
  Star,
} from 'lucide-react';

export interface ReviewData {
  tenantName: string;
  avatar?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface RoomData {
  _id: string;
  name: string;
  slug: string;

  roomType:
  | 'SINGLE'
  | 'DOUBLE'
  | 'STUDIO'
  | 'APARTMENT'
  | 'WHOLE_HOUSE';

  description: string;
  address: string;
  district: string;
  city: string;

  /**
   * Giá phòng lưu trong database.
   *
   * Database mặc định đang lưu bằng USD.
   */
  pricePerMonth: number;

  /**
   * Nếu database không có currency thì mặc định hiểu là USD.
   */
  currency?: 'USD' | 'VND';

  area: number;
  maxPeople: number;

  status:
  | 'AVAILABLE'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'HIDDEN';

  amenities: string[];
  images: string[];
  isFeatured: boolean;
  reviews?: ReviewData[];
  rating?: number;
}

interface RoomCardProps {
  room: RoomData;
}

/**
 * Tỷ giá quy đổi USD sang VND.
 */
const USD_TO_VND_RATE = 26_450;

const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';

const HUMAN_ROOM_TYPES: Record<RoomData['roomType'], string> = {
  SINGLE: 'Phòng đơn',
  DOUBLE: 'Phòng đôi',
  STUDIO: 'Căn hộ Studio',
  APARTMENT: 'Căn hộ',
  WHOLE_HOUSE: 'Nhà nguyên căn',
};

const HUMAN_STATUSES: Record<RoomData['status'], string> = {
  AVAILABLE: 'Còn trống',
  RENTED: 'Đã thuê',
  MAINTENANCE: 'Bảo trì',
  HIDDEN: 'Tạm ẩn',
};

const STATUS_COLORS: Record<RoomData['status'], string> = {
  AVAILABLE:
    'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/5',

  RENTED:
    'border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-500/5',

  MAINTENANCE:
    'border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/5',

  HIDDEN:
    'border-slate-200 bg-slate-100 text-slate-700',
};

/**
 * Chuyển giá phòng sang VND.
 *
 * Nếu không có currency thì mặc định giá trong database là USD.
 */
const convertPriceToVND = (
  price: number,
  currency: RoomData['currency'] = 'VND',
): number => {
  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  if (currency === 'USD') {
    return Math.round(price * USD_TO_VND_RATE);
  }

  return Math.round(price);
};

/**
 * Định dạng tiền Việt Nam.
 *
 * Ví dụ:
 * 79350000 => 79.350.000 ₫
 */
const formatVND = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export const RoomCard = ({ room }: RoomCardProps) => {
  const roomDetailUrl = `/rooms/${room.slug}`;

  const coverImage =
    room.images?.[0]?.trim() || DEFAULT_ROOM_IMAGE;

  /**
   * Database mặc định lưu VND.
   */
  const roomCurrency = room.currency ?? 'VND';

  /**
   * Giá được quy đổi sang VND để hiển thị.
   */
  const priceInVND = convertPriceToVND(
    room.pricePerMonth,
    roomCurrency,
  );

  const isRoomAvailable = room.status === 'AVAILABLE';

  return (
    <article
      className="
        group
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-slate-100
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:shadow-xl
      "
    >
      {/* Ảnh phòng */}
      <div className="relative aspect-[4/3] flex-shrink-0 overflow-hidden bg-slate-100">
        <Link
          to={roomDetailUrl}
          aria-label={`Xem chi tiết ${room.name}`}
          className="block h-full w-full"
        >
          <img
            src={coverImage}
            alt={room.name}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-110
            "
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_ROOM_IMAGE;
            }}
          />
        </Link>

        {/* Trạng thái */}
        <span
          className={`
            absolute
            left-4
            top-4
            z-10
            rounded-full
            border
            px-4
            py-1.5
            text-xs
            font-bold
            ${STATUS_COLORS[room.status]}
          `}
        >
          {HUMAN_STATUSES[room.status]}
        </span>

        {/* Phòng nổi bật */}
        {room.isFeatured && (
          <span
            className="
              absolute
              right-4
              top-4
              z-10
              rounded-full
              border
              border-brand-navy-800/50
              bg-brand-navy-950
              px-4
              py-1.5
              text-xs
              font-bold
              text-brand-teal-400
              shadow-md
            "
          >
            Nổi bật
          </span>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex min-w-0 flex-grow flex-col p-6">
        {/* Loại phòng & Rating */}
        <div className="mb-3 flex items-center justify-between">
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-brand-teal-600
            "
          >
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {HUMAN_ROOM_TYPES[room.roomType]}
            </span>
          </div>
          {room.rating !== undefined && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Star className="h-3 w-3 fill-current" />
              <span>{room.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Tên phòng */}
        <h3
          className="
            mb-3
            min-w-0
            text-lg
            font-bold
            leading-snug
            text-brand-navy-950
            transition-colors
            group-hover:text-brand-teal-600
            h-12
            line-clamp-2
          "
        >
          <Link
            to={roomDetailUrl}
            className="block"
            title={room.name}
          >
            {room.name}
          </Link>
        </h3>

        {/* Địa chỉ */}
        <div className="mb-5 flex min-w-0 items-start gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />

          <span
            className="block min-w-0 truncate"
            title={`${room.address}, ${room.district}, ${room.city}`}
          >
            {room.address}, {room.district}, {room.city}
          </span>
        </div>

        {/* Thông số phòng */}
        <div
          className="
            mb-5
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-3
            border-t
            border-slate-100
            pt-4
            text-sm
            font-semibold
            text-slate-500
          "
        >
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5 flex-shrink-0 text-slate-400" />

            <span className="whitespace-nowrap">
              {room.area.toLocaleString('vi-VN')} m²
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 flex-shrink-0 text-slate-400" />

            <span className="whitespace-nowrap">
              Tối đa {room.maxPeople} người
            </span>
          </div>
        </div>

        {/* Giá và nút xem chi tiết */}
        <div className="mt-auto border-t border-slate-100 pt-5">
          {/* Giá phòng */}
          <div className="min-w-0">
            <div className="flex min-w-0 flex-col">
              <span
                className="
                  block
                  max-w-full
                  whitespace-nowrap
                  text-[clamp(1.55rem,2.2vw,2.1rem)]
                  font-black
                  leading-none
                  tracking-tight
                  text-brand-navy-950
                "
                title={formatVND(priceInVND)}
              >
                {formatVND(priceInVND)}
              </span>

              <span className="mt-2 text-sm font-bold text-slate-400">
                / tháng
              </span>
            </div>
          </div>

          {/* Nút chi tiết */}
          <Link
            to={roomDetailUrl}
            aria-label={`Xem chi tiết phòng ${room.name}`}
            className={`
              mt-5
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              px-5
              py-3
              text-sm
              font-bold
              shadow-md
              transition-all
              duration-300
              active:scale-[0.98]
              ${isRoomAvailable
                ? `
                    bg-brand-navy-950
                    text-white
                    shadow-brand-navy-950/10
                    hover:bg-brand-teal-600
                    hover:shadow-brand-teal-600/25
                  `
                : `
                    bg-slate-200
                    text-slate-600
                    shadow-slate-300/20
                    hover:bg-slate-300
                  `
              }
            `}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
};