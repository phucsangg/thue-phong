import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPassword = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSent(true);
      showToast('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.', 'success');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-brand-navy-950 tracking-tight">Khôi phục mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu mới.
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6 pt-4">
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-4 text-sm font-semibold">
              Một liên kết an toàn đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (hoặc nhật ký console của backend) để tiến hành khôi phục. Liên kết sẽ hết hạn sau 10 phút.
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal-600 hover:text-brand-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.email ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-600">{(errors.email as any)?.message}</p>}
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-navy-900 hover:bg-brand-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Gửi yêu cầu
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand-navy-950 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Hủy và quay lại
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
