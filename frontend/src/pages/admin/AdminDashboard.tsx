import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { roomService } from '../../services/roomService';
import { rentalService } from '../../services/rentalService';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Upload,
} from 'lucide-react';
import type { RoomData } from '../../components/RoomCard';

// Room creation Zod schema
const roomFormSchema = z.object({
  name: z.string().min(3, 'Tên phòng phải có ít nhất 3 ký tự'),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'STUDIO', 'APARTMENT', 'WHOLE_HOUSE']),
  description: z.string().min(10, 'Mô tả phòng phải có ít nhất 10 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  district: z.string().min(2, 'Quận/Huyện phải có ít nhất 2 ký tự'),
  city: z.string().min(2, 'Thành phố phải có ít nhất 2 ký tự'),
  pricePerMonth: z.number().positive('Giá thuê phải lớn hơn 0'),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
  maxPeople: z.number().int().positive('Sức chứa tối thiểu phải có 1 người'),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'HIDDEN']),
  isFeatured: z.boolean(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'rooms' | 'users' | 'requests'>('stats');

  // Modal Control
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
  
  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  
  // Rejection input control
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // 1. Queries
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: authService.getDashboardStats,
  });

  const { data: roomsData, isLoading: isRoomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ['adminRooms'],
    queryFn: async () => {
      // Pass status query to fetch all rooms (including HIDDEN)
      return await roomService.getAllRooms({ limit: 100 });
    },
  });

  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: authService.getAllUsers,
  });

  const { data: requestsData, isLoading: isRequestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: rentalService.getAllRequests,
  });

  // 2. Room mutations
  const createRoomMutation = useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: () => {
      showToast('Đã đăng tải căn phòng mới thành công!', 'success');
      refetchRooms();
      refetchStats();
      closeRoomModal();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Tạo phòng thất bại', 'error');
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => roomService.updateRoom(id, payload),
    onSuccess: () => {
      showToast('Cập nhật thông tin phòng thành công!', 'success');
      refetchRooms();
      refetchStats();
      closeRoomModal();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Cập nhật thông tin thất bại', 'error');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: roomService.deleteRoom,
    onSuccess: () => {
      showToast('Đã xóa phòng thành công!', 'success');
      refetchRooms();
      refetchStats();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Xóa phòng thất bại', 'error');
    },
  });

  // 3. User mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'USER' }) => authService.updateUserRole(id, role),
    onSuccess: () => {
      showToast('Cập nhật vai trò người dùng thành công!', 'success');
      refetchUsers();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => authService.updateUserStatus(id, isVerified),
    onSuccess: () => {
      showToast('Cập nhật trạng thái xác minh tài khoản thành công!', 'success');
      refetchUsers();
    },
  });

  // 4. Request mutations
  const approveRequestMutation = useMutation({
    mutationFn: rentalService.approveRequest,
    onSuccess: () => {
      showToast('Duyệt yêu cầu thuê thành công! Trạng thái phòng chuyển sang Đã thuê.', 'success');
      refetchRequests();
      refetchRooms();
      refetchStats();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Không thể chấp thuận yêu cầu thuê', 'error');
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => rentalService.rejectRequest(id, note),
    onSuccess: () => {
      showToast('Đã từ chối yêu cầu thuê phòng.', 'success');
      refetchRequests();
      refetchStats();
      setRejectionId(null);
      setRejectionNote('');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Không thể từ chối yêu cầu thuê', 'error');
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(roomFormSchema),
  });

  const openAddModal = () => {
    setEditingRoom(null);
    setUploadedUrls([]);
    reset({
      name: '',
      roomType: 'STUDIO',
      description: '',
      address: '',
      district: '',
      city: '',
      pricePerMonth: 300,
      area: 25,
      maxPeople: 2,
      status: 'AVAILABLE',
      isFeatured: false,
    });
    setIsRoomModalOpen(true);
  };

  const openEditModal = (room: RoomData) => {
    setEditingRoom(room);
    setUploadedUrls(room.images || []);
    reset({
      name: room.name,
      roomType: room.roomType,
      description: room.description,
      address: room.address,
      district: room.district,
      city: room.city,
      pricePerMonth: room.pricePerMonth,
      area: room.area,
      maxPeople: room.maxPeople,
      status: room.status,
      isFeatured: room.isFeatured,
    });
    setIsRoomModalOpen(true);
  };

  const closeRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
    setUploadedUrls([]);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      const res = await roomService.uploadImages(fileArray);
      if (res.status === 'success' && res.data?.images) {
        setUploadedUrls((prev) => [...prev, ...res.data.images]);
        showToast('Images uploaded successfully!', 'success');
      }
    } catch (err: any) {
      showToast('Image upload failed. Check format/size.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (urlToRemove: string) => {
    setUploadedUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleRoomFormSubmit = (values: RoomFormValues) => {
    const payload = {
      ...values,
      images: uploadedUrls,
    };

    if (editingRoom) {
      updateRoomMutation.mutate({ id: editingRoom._id, payload });
    } else {
      createRoomMutation.mutate(payload);
    }
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('Are you sure you want to delete this room permanently?')) {
      deleteRoomMutation.mutate(id);
    }
  };

  const handleRoleToggle = (id: string, currentRole: 'ADMIN' | 'USER') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    updateRoleMutation.mutate({ id, role: newRole });
  };

  const handleVerifyToggle = (id: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, isVerified: !currentStatus });
  };

  const handleApproveRequest = (id: string) => {
    if (window.confirm('Approve this request? Room will turn RENTED.')) {
      approveRequestMutation.mutate(id);
    }
  };

  const handleRejectRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionId) return;
    rejectRequestMutation.mutate({ id: rejectionId, note: rejectionNote.trim() });
  };

  const stats = statsData?.data?.stats;
  const rooms = roomsData?.data?.rooms as RoomData[] || [];
  const users = usersData?.data?.users || [];
  const requests = requestsData?.data?.rentalRequests || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-brand-navy-950 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-brand-teal-600" />
          Trung tâm Quản trị
        </h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Thực hiện quản trị danh sách phòng, kiểm duyệt yêu cầu thuê và xem số liệu thống kê.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        {(['stats', 'rooms', 'users', 'requests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab
                ? 'border-brand-teal-600 text-brand-teal-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'stats' ? 'Tổng quan' : tab === 'rooms' ? 'Quản lý phòng' : tab === 'users' ? 'Người dùng' : 'Yêu cầu thuê'}
          </button>
        ))}
      </div>

      {/* 1. Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {isStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-32 bg-gray-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-brand-navy-950">{stats?.totalUsers}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng người dùng</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-brand-navy-950">{stats?.totalRooms}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng căn phòng</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-brand-navy-950">{stats?.totalRequests}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Yêu cầu thuê phòng</span>
                  </div>
                </div>
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rooms Breakdown */}
                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-md font-black text-brand-navy-950 border-b border-gray-100 pb-3 uppercase tracking-wider text-gray-400">
                    Phân loại trạng thái phòng
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-emerald-600">{stats?.rooms?.AVAILABLE}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Còn trống</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-rose-600">{stats?.rooms?.RENTED}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Đã thuê</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-amber-600">{stats?.rooms?.MAINTENANCE}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Bảo trì</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-gray-600">{stats?.rooms?.HIDDEN}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Đang ẩn</span>
                    </div>
                  </div>
                </div>

                {/* Requests Breakdown */}
                <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-md font-black text-brand-navy-950 border-b border-gray-100 pb-3 uppercase tracking-wider text-gray-400">
                    Phân loại yêu cầu thuê
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-amber-600">{stats?.requests?.PENDING}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Chờ duyệt</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-emerald-600">{stats?.requests?.APPROVED}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Đã duyệt</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-rose-600">{stats?.requests?.REJECTED}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Từ chối</span>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <span className="block text-2xl font-bold text-gray-600">{stats?.requests?.CANCELLED}</span>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Đã hủy</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. Rooms Manager Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-brand-navy-950">Quản lý căn phòng</h3>
            <button
              onClick={openAddModal}
              className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng mới
            </button>
          </div>

          {isRoomsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-150 rounded-2xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 font-bold text-gray-450 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Tên phòng</th>
                    <th className="px-6 py-4 text-left">Vị trí</th>
                    <th className="px-6 py-4 text-left">Loại</th>
                    <th className="px-6 py-4 text-left">Giá</th>
                    <th className="px-6 py-4 text-left">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-brand-navy-950">{room.name}</td>
                      <td className="px-6 py-4 text-xs">{`${room.district}, ${room.city}`}</td>
                      <td className="px-6 py-4 text-xs font-bold text-brand-teal-600">{room.roomType}</td>
                      <td className="px-6 py-4">${room.pricePerMonth}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-50">
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="p-2 border border-gray-100 hover:border-gray-250 text-gray-500 hover:text-brand-navy-900 rounded-lg bg-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="p-2 border border-gray-100 hover:border-gray-250 text-rose-500 hover:bg-rose-50 rounded-lg bg-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Users Manager Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="text-lg font-black text-brand-navy-950">Danh sách người dùng hệ thống</h3>

          {isUsersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-150 rounded-2xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 font-bold text-gray-450 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Tên người dùng</th>
                    <th className="px-6 py-4 text-left">Địa chỉ Email</th>
                    <th className="px-6 py-4 text-left">Số điện thoại</th>
                    <th className="px-6 py-4 text-left">Vai trò</th>
                    <th className="px-6 py-4 text-left">Trạng thái xác minh</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                  {users.map((u: any) => (
                    <tr key={u._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-brand-navy-950">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 text-xs">{u.phone || 'Chưa cập nhật'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-black ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'}`}>
                          {u.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => handleRoleToggle(u._id, u.role)}
                          className="px-3 py-1.5 border border-gray-150 rounded-lg hover:bg-gray-50 font-bold"
                        >
                          Đổi vai trò
                        </button>
                        <button
                          onClick={() => handleVerifyToggle(u._id, u.isVerified)}
                          className="px-3 py-1.5 border border-gray-150 rounded-lg hover:bg-gray-50 font-bold"
                        >
                          Duyệt xác minh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Requests Manager Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <h3 className="text-lg font-black text-brand-navy-950">Kiểm duyệt yêu cầu thuê phòng</h3>

          {isRequestsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-150 rounded-2xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50 font-bold text-gray-450 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Phòng / Người dùng</th>
                    <th className="px-6 py-4 text-left">Ngày vào / Thời hạn</th>
                    <th className="px-6 py-4 text-left">Giá</th>
                    <th className="px-6 py-4 text-left">Trạng thái</th>
                    <th className="px-6 py-4 text-left">Lời nhắn / Phản hồi</th>
                    <th className="px-6 py-4 text-right">Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                  {requests.map((r: any) => (
                    <tr key={r._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-navy-950">{r.room?.name || '[Phòng đã bị xóa]'}</div>
                        <div className="text-xs text-gray-400 font-semibold mt-0.5">{r.user?.name} ({r.user?.email})</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>Ngày vào: {new Date(r.startDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-gray-450 mt-0.5">Thời hạn: {r.durationMonths} tháng</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-navy-900">
                        {r.room ? `$${r.room.pricePerMonth}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-55 font-bold">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs max-w-xs truncate">
                        {r.message && <div className="text-gray-500 font-medium line-clamp-1">"{r.message}"</div>}
                        {r.note && <div className="text-rose-600 font-semibold mt-0.5">Phản hồi: "{r.note}"</div>}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {r.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r._id)}
                              className="p-2 border border-emerald-100 hover:border-emerald-250 text-emerald-600 hover:bg-emerald-50 rounded-lg bg-white"
                              title="Chấp nhận yêu cầu"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectionId(r._id)}
                              className="p-2 border border-rose-100 hover:border-rose-250 text-rose-600 hover:bg-rose-50 rounded-lg bg-white"
                              title="Từ chối yêu cầu"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Reject Request Note Overlay Dialog */}
      {rejectionId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy-950/45 backdrop-blur-sm">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl w-full max-w-md shadow-xl animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-black text-brand-navy-950">Lý do từ chối yêu cầu</h3>
              <button onClick={() => setRejectionId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectRequestSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Phản hồi cho người dùng (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Ví dụ: hồ sơ của bạn chưa đủ điều kiện, phòng đã cho khách hàng khác thuê trước..."
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionId(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-500"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add/Edit Room Modal Overlay */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy-950/45 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-white border border-gray-150 p-6 rounded-3xl w-full max-w-2xl shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-lg font-black text-brand-navy-950">
                {editingRoom ? `Chỉnh sửa phòng: ${editingRoom.name}` : 'Thêm phòng mới'}
              </h3>
              <button onClick={closeRoomModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleRoomFormSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Tên phòng
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Ví dụ: Căn hộ Studio Quận 1"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.name ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.name as any)?.message}</p>}
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Loại phòng
                  </label>
                  <select
                    {...register('roomType')}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all"
                  >
                    <option value="SINGLE">Phòng đơn</option>
                    <option value="DOUBLE">Phòng đôi</option>
                    <option value="STUDIO">Căn hộ Studio</option>
                    <option value="APARTMENT">Căn hộ chung cư</option>
                    <option value="WHOLE_HOUSE">Nhà nguyên căn</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Trạng thái phòng
                  </label>
                  <select
                    {...register('status')}
                    className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all"
                  >
                    <option value="AVAILABLE">AVAILABLE (Còn trống)</option>
                    <option value="RENTED">RENTED (Đã thuê)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                    <option value="HIDDEN">HIDDEN (Ẩn)</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Giá thuê / tháng (USD)
                  </label>
                  <input
                    type="number"
                    {...register('pricePerMonth', { valueAsNumber: true })}
                    placeholder="Ví dụ: 500"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.pricePerMonth ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.pricePerMonth && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.pricePerMonth as any)?.message}</p>}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Diện tích (m²)
                  </label>
                  <input
                    type="number"
                    {...register('area', { valueAsNumber: true })}
                    placeholder="Ví dụ: 35"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.area ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.area && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.area as any)?.message}</p>}
                </div>

                {/* Max People */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Sức chứa tối đa (Người)
                  </label>
                  <input
                    type="number"
                    {...register('maxPeople', { valueAsNumber: true })}
                    placeholder="Ví dụ: 2"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.maxPeople ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.maxPeople && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.maxPeople as any)?.message}</p>}
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    {...register('isFeatured')}
                    className="w-4 h-4 rounded text-brand-teal-655 focus:ring-brand-teal-500 border-gray-300"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-bold text-gray-600 select-none">
                    Nổi bật trên trang chủ
                  </label>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Ví dụ: 123 Hue St"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.address ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.address as any)?.message}</p>}
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    {...register('district')}
                    placeholder="Ví dụ: Quận 1"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.district ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.district && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.district as any)?.message}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="Ví dụ: Hà Nội"
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.city ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.city as any)?.message}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Mô tả chi tiết phòng
                  </label>
                  <textarea
                    rows={4}
                    {...register('description')}
                    placeholder="Cung cấp thông tin chi tiết về sơ đồ phòng, nội quy, tiện ích và môi trường xung quanh..."
                    className={`block w-full px-3 py-2 border rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      errors.description ? 'border-rose-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-xs font-semibold text-rose-600">{(errors.description as any)?.message}</p>}
                </div>

                {/* Cloudinary Image Uploader */}
                <div className="md:col-span-2 border-t border-gray-100 pt-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Hình ảnh phòng (Đăng tải qua Cloudinary)
                  </label>
                  
                  {/* File Pick button */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-dashed border-gray-300 hover:border-brand-teal-555 rounded-xl cursor-pointer bg-gray-50 hover:bg-white text-xs font-bold text-gray-600 transition-all">
                      <Upload className="w-4 h-4 text-gray-400" />
                      Chọn ảnh (Tối đa 5 ảnh)
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {uploadingImages && (
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-teal-600" />
                        Đang tải ảnh lên Cloudinary...
                      </div>
                    )}
                  </div>

                  {/* Uploaded Previews */}
                  {uploadedUrls.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 pt-2">
                      {uploadedUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group bg-gray-100 border border-gray-150">
                          <img src={url} alt="Room preview" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(url)}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 p-1 rounded-full text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={closeRoomModal}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-500"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                  className="px-6 py-2.5 bg-brand-navy-900 hover:bg-brand-teal-600 text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {createRoomMutation.isPending || updateRoomMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : editingRoom ? (
                    'Lưu thay đổi'
                  ) : (
                    'Đăng tải phòng'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
