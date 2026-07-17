import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang tiến hành xác thực tài khoản của bạn...');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Mã xác thực không hợp lệ hoặc đã bị thiếu.');
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Xác thực tài khoản của bạn thành công!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Xác thực tài khoản không thành công. Mã có thể đã hết hạn hoặc không chính xác.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0072bc] to-[#f15a24]"></div>
        
        {status === 'loading' && (
          <div className="space-y-6 py-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-[#0072bc] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-brand-navy-950">Đang xác thực</h2>
              <p className="text-sm font-semibold text-slate-400">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 py-6">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-[#0072bc]/10 rounded-full blur-xl scale-75 animate-pulse"></div>
              <CheckCircle2 className="w-20 h-20 text-[#0072bc] relative z-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-brand-navy-950 flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                Thành công!
              </h2>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="pt-4">
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center py-3 px-6 rounded-2xl text-white font-extrabold text-sm bg-gradient-to-r from-[#0072bc] to-blue-600 hover:from-blue-600 hover:to-[#0072bc] shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-6">
            <div className="flex justify-center">
              <XCircle className="w-20 h-20 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-brand-navy-950">Thất bại</h2>
              <p className="text-sm font-semibold text-rose-500/90 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <Link
                to="/register"
                className="w-full inline-flex justify-center items-center py-3 px-6 rounded-2xl text-[#0072bc] font-extrabold text-sm border border-slate-200 hover:bg-slate-50 active:scale-98 transition-all"
              >
                Đăng ký lại tài khoản
              </Link>
              <Link
                to="/"
                className="block text-xs font-bold text-slate-400 hover:text-brand-navy-950 hover:underline"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
