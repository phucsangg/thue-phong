import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { User as UserIcon, Mail, Lock, Phone, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50),
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().regex(/^[0-9+]{9,15}$/, 'Định dạng số điện thoại không hợp lệ').optional().or(z.literal('')),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    // Clean empty phone number
    const payload = {
      ...data,
      phone: data.phone === '' ? undefined : data.phone,
    };
    try {
      const response = await authService.register(payload);
      if (response.status === 'success') {
        showToast(response.message || 'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.', 'success');
        setRegisteredEmail(data.email);
        setIsPendingVerification(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPendingVerification && registeredEmail && !isVerifiedSuccess) {
      interval = setInterval(async () => {
        try {
          const res = await authService.checkVerification(registeredEmail);
          if (res.isVerified) {
            setIsVerifiedSuccess(true);
            showToast('Xác thực email thành công! Đang chuyển hướng...', 'success');
            clearInterval(interval);
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (err) {
          console.error('Polling verification status failed:', err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPendingVerification, registeredEmail, isVerifiedSuccess]);

  const handleManualCheck = async () => {
    if (checkLoading || isVerifiedSuccess) return;
    setCheckLoading(true);
    try {
      const res = await authService.checkVerification(registeredEmail);
      if (res.isVerified) {
        setIsVerifiedSuccess(true);
        showToast('Xác thực email thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showToast('Hệ thống chưa ghi nhận tài khoản đã xác thực. Vui lòng nhấn vào nút trong email của bạn.', 'info');
      }
    } catch (err) {
      showToast('Có lỗi xảy ra khi kiểm tra trạng thái xác thực.', 'error');
    } finally {
      setCheckLoading(false);
    }
  };

  if (isPendingVerification) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50/50">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-slate-100/50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0072bc] to-[#f15a24]"></div>
          
          {isVerifiedSuccess ? (
            <div className="space-y-6 py-6">
              <div className="flex justify-center relative">
                <div className="absolute inset-0 bg-[#0072bc]/10 rounded-full blur-xl scale-75 animate-pulse"></div>
                <CheckCircle2 className="w-20 h-20 text-[#0072bc] relative z-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-brand-navy-950 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  Xác thực thành công!
                </h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  Tài khoản của bạn đã được kích hoạt. Đang đưa bạn đến trang Đăng nhập...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center w-24 h-24">
                  <div className="absolute w-20 h-20 border-4 border-[#0072bc] border-t-transparent rounded-full animate-spin"></div>
                  <Mail className="w-10 h-10 text-[#0072bc] animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-brand-navy-950">Chờ xác thực Email</h2>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  Chúng tôi đã gửi một email xác thực đến địa chỉ:<br />
                  <span className="font-extrabold text-[#0072bc]">{registeredEmail}</span>
                </p>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-550 leading-relaxed font-semibold">
                  Mở email và nhấp vào nút <span className="text-[#0072bc] font-bold">Xác thực tài khoản</span> để kích hoạt tài khoản của bạn. Trang này sẽ tự động chuyển hướng sau khi hoàn tất.
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={checkLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-navy-900 hover:bg-brand-teal-600 transition-all shadow-md disabled:opacity-50"
                >
                  {checkLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Tôi đã xác thực xong'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPendingVerification(false);
                    setRegisteredEmail('');
                  }}
                  className="block w-full text-xs font-bold text-slate-400 hover:text-brand-navy-950 hover:underline transition-all"
                >
                  Thay đổi email / Quay lại đăng ký
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black text-brand-navy-950 tracking-tight">Tạo tài khoản mới</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-brand-teal-600 hover:text-brand-teal-700 font-bold transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.name ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
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
                  placeholder="john@example.com"
                  {...register('email')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.email ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Số điện thoại (Tùy chọn)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone"
                  type="text"
                  placeholder="0987654321"
                  {...register('phone')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl text-brand-navy-950 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all text-sm font-medium ${
                    errors.phone ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Mật khẩu
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
              {errors.password && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.password.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-navy-900 hover:bg-brand-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Đăng ký
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
