import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import {
  User,
  Phone,
  Image,
  Lock,
  Shield,
  UserCheck,
  Calendar,
  MapPin,
  AlignLeft,
  Info,
  Upload,
  Loader2,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^[0-9+]{9,15}$/, 'Định dạng số điện thoại không hợp lệ').optional().or(z.literal('')),
  avatar: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  bio: z.string().max(200, 'Giới thiệu bản thân tối đa 200 ký tự').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không trùng khớp',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      gender: (user as any)?.gender || 'MALE',
      dateOfBirth: (user as any)?.dateOfBirth ? new Date((user as any).dateOfBirth).toISOString().split('T')[0] : '',
      address: (user as any)?.address || '',
      bio: (user as any)?.bio || '',
    },
  });

  const watchedAvatar = watchProfile('avatar');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await authService.uploadAvatar(file);
      if (res.status === 'success' && res.data?.avatar) {
        setProfileValue('avatar', res.data.avatar, { shouldDirty: true });
        showToast('Tải ảnh đại diện lên thành công!', 'success');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Lỗi khi tải ảnh đại diện lên';
      showToast(message, 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    const payload = {
      name: data.name,
      phone: data.phone === '' ? undefined : data.phone,
      avatar: data.avatar === '' ? undefined : data.avatar,
      gender: data.gender === '' ? undefined : data.gender,
      dateOfBirth: data.dateOfBirth && data.dateOfBirth !== '' ? new Date(data.dateOfBirth) : undefined,
      address: data.address === '' ? undefined : data.address,
      bio: data.bio === '' ? undefined : data.bio,
    };
    try {
      const res = await authService.updateProfile(payload);
      if (res.status === 'success' && res.data?.user) {
        updateUser(res.data.user);
        showToast('Cập nhật thông tin cá nhân thành công!', 'success');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể cập nhật thông tin cá nhân';
      showToast(message, 'error');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showToast('Cập nhật mật khẩu thành công!', 'success');
      resetPasswordForm();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Mật khẩu hiện tại không chính xác';
      showToast(message, 'error');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-brand-navy-950 tracking-tight flex items-center gap-2">
          <UserCheck className="w-8 h-8 text-brand-teal-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-gray-500 font-semibold mt-1">
          Quản lý thông tin liên hệ và cài đặt bảo mật tài khoản.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Avatar details summary & quick updates */}
        <div className="lg:col-span-1 bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-teal-500 shadow-md bg-slate-50 relative">
              <img
                src={watchedAvatar || user?.avatar || '/avatar.jpg'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy-950">{user?.name}</h2>
            <span className="inline-block mt-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
              {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>

          <div className="w-full border-t border-gray-100 pt-4 text-left space-y-3.5 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-teal-600" />
              <span>Trạng thái: <span className="text-emerald-600 font-bold">Hoạt động</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal-600" />
              <span>Tham gia: {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Update Profile Details & Security */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-gray-150 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-navy-950 flex items-center gap-1.5 pb-3 border-b border-gray-100">
              <Info className="w-5 h-5 text-brand-teal-600" />
              Thông tin chi tiết tài khoản
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Họ và Tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      {...registerProfile('name')}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                        profileErrors.name ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {profileErrors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{(profileErrors.name as any)?.message}</p>}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Địa chỉ Email (Cố định)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-455 text-sm font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="0987654321"
                      {...registerProfile('phone')}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                        profileErrors.phone ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {profileErrors.phone && <p className="mt-1 text-xs font-semibold text-rose-600">{(profileErrors.phone as any)?.message}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Giới tính
                  </label>
                  <select
                    {...registerProfile('gender')}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      {...registerProfile('dateOfBirth')}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brand-navy-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Địa chỉ liên hệ
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Quận 1, TP. Hồ Chí Minh"
                      {...registerProfile('address')}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-brand-navy-950 placeholder-gray-450 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Ảnh đại diện
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-grow">
                      <Image className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Đường dẫn ảnh hoặc tải file lên..."
                        {...registerProfile('avatar')}
                        className={`block w-full pl-10 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                          profileErrors.avatar ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    <label className="flex items-center justify-center gap-1.5 px-5 py-3 border border-dashed border-gray-300 hover:border-brand-teal-555 rounded-xl cursor-pointer bg-gray-50 hover:bg-white text-xs font-bold text-gray-600 transition-all shrink-0">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-teal-500" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-450" />
                      )}
                      <span>Tải ảnh lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {profileErrors.avatar && <p className="mt-1 text-xs font-semibold text-rose-600">{(profileErrors.avatar as any)?.message}</p>}
                </div>

                {/* Biography (Bio) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Giới thiệu bản thân
                  </label>
                  <div className="relative">
                    <AlignLeft className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={3}
                      placeholder="Mô tả đôi nét về bản thân của bạn..."
                      {...registerProfile('bio')}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                        profileErrors.bio ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {profileErrors.bio && <p className="mt-1 text-xs font-semibold text-rose-600">{(profileErrors.bio as any)?.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-brand-teal-500/10 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isProfileLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Change Password Card */}
          <section className="bg-white border border-gray-150 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-navy-950 flex items-center gap-1.5 pb-3 border-b border-gray-100">
              <Lock className="w-5 h-5 text-brand-teal-600" />
              Mật khẩu &amp; Bảo mật
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('currentPassword')}
                    className={`block w-full px-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      passwordErrors.currentPassword ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                    }`}
                  />
                  {passwordErrors.currentPassword && <p className="mt-1 text-xs font-semibold text-rose-600">{(passwordErrors.currentPassword as any)?.message}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('newPassword')}
                    className={`block w-full px-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      passwordErrors.newPassword ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                    }`}
                  />
                  {passwordErrors.newPassword && <p className="mt-1 text-xs font-semibold text-rose-600">{(passwordErrors.newPassword as any)?.message}</p>}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirmPassword')}
                    className={`block w-full px-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all ${
                      passwordErrors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                    }`}
                  />
                  {passwordErrors.confirmPassword && <p className="mt-1 text-xs font-semibold text-rose-600">{(passwordErrors.confirmPassword as any)?.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="bg-brand-navy-950 text-white hover:bg-brand-teal-600 font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-brand-navy-950/10 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isPasswordLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};
