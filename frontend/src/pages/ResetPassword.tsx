import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Lock, ArrowRight } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không trùng khớp',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      showToast('Mã khôi phục mật khẩu không hợp lệ', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Mã khôi phục không hợp lệ hoặc đã hết hạn';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-brand-navy-950 tracking-tight">Tạo mật khẩu mới</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium font-inter">
            Nhập mật khẩu an toàn mới của bạn bên dưới để truy cập tài khoản.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.password ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-semibold text-rose-600">{(errors.password as any)?.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-semibold text-rose-600">{(errors.confirmPassword as any)?.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-navy-900 hover:bg-brand-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Đặt lại mật khẩu
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

