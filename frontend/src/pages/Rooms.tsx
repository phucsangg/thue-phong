import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomService } from '../services/roomService';
import { RoomCard } from '../components/RoomCard';
import type { RoomData } from '../components/RoomCard';
import { CardSkeleton } from '../components/Skeleton';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const CITIES = ['Hà Nội', 'Thành phố Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Nha Trang', 'Vũng Tàu'];
const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Phòng đơn' },
  { value: 'DOUBLE', label: 'Phòng đôi' },
  { value: 'STUDIO', label: 'Căn hộ Studio' },
  { value: 'APARTMENT', label: 'Căn hộ chung cư' },
  { value: 'WHOLE_HOUSE', label: 'Nhà nguyên căn' },
];

export const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local filter states syncing with URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [areaMin, setAreaMin] = useState(searchParams.get('areaMin') || '');
  const [areaMax, setAreaMax] = useState(searchParams.get('areaMax') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync inputs if URL params change externally (e.g. searching from Home page)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Build query parameter object for API
  const queryParams = {
    page,
    limit: 9,
    search: searchParams.get('search') || undefined,
    roomType: searchParams.get('roomType') || undefined,
    city: searchParams.get('city') || undefined,
    priceMin: searchParams.get('priceMin') || undefined,
    priceMax: searchParams.get('priceMax') || undefined,
    areaMin: searchParams.get('areaMin') || undefined,
    areaMax: searchParams.get('areaMax') || undefined,
    sort: searchParams.get('sort') || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms', queryParams],
    queryFn: async () => {
      const response = await roomService.getAllRooms(queryParams);
      return response;
    },
  });

  const applyFilters = (newParams: Record<string, string | number>) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    // Reset page on filter change except when modifying page directly
    if (!newParams.page) {
      updatedParams.delete('page');
      setPage(1);
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        updatedParams.set(key, String(value));
      } else {
        updatedParams.delete(key);
      }
    });

    setSearchParams(updatedParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search, page: 1 });
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoomType('');
    setCity('');
    setPriceMin('');
    setPriceMax('');
    setAreaMin('');
    setAreaMax('');
    setSort('createdAt');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    applyFilters({ page: newPage });
  };

  const rooms = data?.data?.rooms as RoomData[] || [];
  const pagination = data?.pagination || { page: 1, limit: 9, totalPages: 1, totalRooms: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy-950 tracking-tight">Danh sách phòng trống</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1">
            Tìm thấy {pagination.totalRooms} phòng phù hợp với yêu cầu.
          </p>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="w-full md:w-auto flex gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-grow md:flex-grow-0 relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo từ khóa..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all w-full md:w-64"
            />
          </form>
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden flex items-center justify-center p-2 border border-gray-200 rounded-xl bg-white text-gray-600 hover:text-brand-navy-950"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters - Desktop */}
        <aside className={`bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h3 className="font-black text-brand-navy-950 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-teal-600" />
              Bộ lọc phòng
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-gray-400 hover:text-brand-teal-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Đặt lại
            </button>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Thành phố</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                applyFilters({ city: e.target.value, page: 1 });
              }}
              className="block w-full px-3 py-2 border border-gray-250 rounded-xl text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
            >
              <option value="">Tất cả thành phố</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Room Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Loại phòng</label>
            <select
              value={roomType}
              onChange={(e) => {
                setRoomType(e.target.value);
                applyFilters({ roomType: e.target.value, page: 1 });
              }}
              className="block w-full px-3 py-2 border border-gray-250 rounded-xl text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
            >
              <option value="">Tất cả loại</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Giá thuê tối đa (USD)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={() => applyFilters({ priceMin, page: 1 })}
                placeholder="Thấp nhất"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
              />
              <span className="text-gray-400 text-xs font-bold">&ndash;</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={() => applyFilters({ priceMax, page: 1 })}
                placeholder="Cao nhất"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Area Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Diện tích (m²)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                onBlur={() => applyFilters({ areaMin, page: 1 })}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
              />
              <span className="text-gray-400 text-xs font-bold">&ndash;</span>
              <input
                type="number"
                value={areaMax}
                onChange={(e) => setAreaMax(e.target.value)}
                onBlur={() => applyFilters({ areaMax, page: 1 })}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Sắp xếp theo</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                applyFilters({ sort: e.target.value, page: 1 });
              }}
              className="block w-full px-3 py-2 border border-gray-255 rounded-xl text-brand-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
            >
              <option value="createdAt">Tin mới nhất</option>
              <option value="priceAsc">Giá: Thấp đến Cao</option>
              <option value="priceDesc">Giá: Cao đến Thấp</option>
              <option value="areaDesc">Diện tích: Lớn đến Nhỏ</option>
            </select>
          </div>
        </aside>

        {/* Rooms Grid */}
        <div className="lg:col-span-3 space-y-10">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-rose-50 border border-rose-150 text-rose-800 rounded-2xl font-semibold">
              Không thể tải danh sách phòng. Vui lòng tải lại trang hoặc thử lại sau.
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium">
              Không có phòng nào phù hợp với bộ lọc hiện tại. Vui lòng tìm kiếm lại.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-brand-navy-950">
                    Trang {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
