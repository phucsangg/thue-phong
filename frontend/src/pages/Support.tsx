import { HelpCircle, Mail, Phone, MapPin, Send } from 'lucide-react';
import React, { useState } from 'react';

export const Support = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-inter text-slate-700 text-left">
      <div className="flex items-center gap-3 border-b pb-4 mb-8">
        <HelpCircle className="w-10 h-10 text-[#0072bc]" />
        <div>
          <h1 className="text-3xl font-black text-brand-navy-950">Hỗ trợ &amp; Liên hệ</h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">iSinhvien luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column: Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-brand-navy-950">Thông tin liên hệ</h2>
          <p className="leading-relaxed">
            Nếu bạn gặp khó khăn trong quá trình đăng ký, xác thực tài khoản, tìm phòng trọ hoặc cần hỗ trợ về mặt kỹ thuật, vui lòng liên hệ trực tiếp với chúng tôi qua các kênh dưới đây:
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0072bc]/10 flex items-center justify-center text-[#0072bc]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Điện thoại</p>
                <p className="text-sm font-bold text-brand-navy-950">078 680 4768</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0072bc]/10 flex items-center justify-center text-[#0072bc]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Email hỗ trợ</p>
                <p className="text-sm font-bold text-brand-navy-950">sangkho12112@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0072bc]/10 flex items-center justify-center text-[#0072bc]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Địa chỉ</p>
                <p className="text-sm font-bold text-brand-navy-950">TP. Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Contact Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-extrabold text-brand-navy-950 mb-6">Gửi tin nhắn hỗ trợ</h2>
          
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
              <p className="font-bold text-base">Gửi yêu cầu thành công!</p>
              <p className="text-sm text-emerald-700/90 leading-relaxed">Chúng tôi đã nhận được thông tin phản hồi của bạn và sẽ liên hệ hỗ trợ trong thời gian sớm nhất.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-[#0072bc] hover:underline"
              >
                Gửi thêm một tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0072bc] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Địa chỉ Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0072bc] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nội dung hỗ trợ</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Hãy nhập nội dung bạn cần hỗ trợ..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0072bc] text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0072bc] hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Gửi yêu cầu hỗ trợ
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
