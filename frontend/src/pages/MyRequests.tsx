import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { rentalService } from '../services/rentalService';
import { useToast } from '../context/ToastContext';
import { Info, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export const MyRequests = () => {
  const { showToast } = useToast();

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const res = await rentalService.getMyRequests();
      return res.data?.rentalRequests || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return await rentalService.cancelRequest(id);
    },
    onSuccess: (data: any) => {
      if (data?.status === 'success') {
        showToast('Đã hủy yêu cầu thuê phòng thành công', 'success');
        refetch();
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Hủy yêu cầu thuê phòng thất bại';
      showToast(msg, 'error');
    },
  });

  const handleCancelClick = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy yêu cầu thuê phòng này không?')) {
      cancelMutation.mutate(id);
    }
  };

  const statusBadges: Record<string, ReactNode> = {
    PENDING: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Đang chờ duyệt
      </span>
    ),
    APPROVED: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-250">
        <CheckCircle className="w-3 h-3" />
        Đã chấp nhận
      </span>
    ),
    REJECTED: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-250">
        <XCircle className="w-3 h-3" />
        Bị từ chối
      </span>
    ),
    CANCELLED: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-750 border border-gray-250">
        <XCircle className="w-3 h-3" />
        Đã hủy
      </span>
    ),
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-12 bg-rose-50 border border-rose-150 text-rose-800 rounded-2xl font-semibold">
          Không thể tải danh sách yêu cầu thuê. Vui lòng làm mới trang hoặc thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-brand-navy-950 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-brand-teal-600" />
          Yêu cầu thuê của tôi
        </h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Xem lịch sử đăng ký, các yêu cầu đang chờ duyệt, bị từ chối hoặc đã được chấp thuận.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl space-y-4">
          <Info className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-brand-navy-950">Chưa có yêu cầu nào</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Bạn chưa thực hiện bất kỳ yêu cầu thuê phòng nào. Hãy khám phá các phòng trống để tìm căn hộ ưng ý.
          </p>
          <Link
            to="/rooms"
            className="inline-block bg-brand-navy-900 hover:bg-brand-teal-600 text-brand-teal-400 hover:text-white border border-brand-navy-800 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            Tìm kiếm phòng
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => {
            const room = request.room;
            const roomImg = room?.images && room.images.length > 0
              ? room.images[0]
              : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300';

            return (
              <div
                key={request._id}
                className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Room Info */}
                <div className="flex gap-4 items-start md:items-center flex-grow">
                  <img
                    src={roomImg}
                    alt={room?.name || 'Room image'}
                    className="w-20 h-16 rounded-xl object-cover bg-gray-55 border border-gray-100 flex-shrink-0"
                  />
                  <div>
                    {room ? (
                      <h4 className="font-bold text-brand-navy-950 text-base hover:text-brand-teal-600 transition-colors">
                        <Link to={`/rooms/${room.slug}`}>{room.name}</Link>
                      </h4>
                    ) : (
                      <h4 className="font-bold text-gray-400 text-base italic">[Phòng đã bị xóa]</h4>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 mt-1">
                      {room && (
                        <span>
                          {room.district}, {room.city}
                        </span>
                      )}
                      <span>
                        Thời hạn: {request.durationMonths} tháng
                      </span>
                      <span>
                        Ngày dọn vào: {new Date(request.startDate).toLocaleDateString('vi-VN')}
                      </span>
                      {room && (
                        <span className="text-brand-navy-900 font-bold">
                          {room.pricePerMonth.toLocaleString('vi-VN')}đ/tháng
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex items-center gap-6 flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex-row justify-between md:justify-end">
                  <div className="flex flex-col gap-1.5 items-start md:items-end">
                    {statusBadges[request.status]}
                    {request.status === 'REJECTED' && request.note && (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50/50 px-2 py-1 rounded-lg border border-rose-100 max-w-xs text-left md:text-right">
                        Phản hồi: {request.note}
                      </span>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelClick(request._id)}
                      disabled={cancelMutation.isPending}
                      className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
                    >
                      Hủy yêu cầu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

