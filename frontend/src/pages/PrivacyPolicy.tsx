import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-inter text-slate-700 text-left">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Shield className="w-10 h-10 text-[#0072bc]" />
          <div>
            <h1 className="text-3xl font-black text-brand-navy-950">Chính sách bảo mật</h1>
            <p className="text-sm text-slate-400 font-semibold mt-1">Cập nhật lần cuối: 17 tháng 7, 2026</p>
          </div>
        </div>

        <p className="text-base leading-relaxed">
          Chào mừng bạn đến với <strong>iSinhvien</strong>. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu khi bạn sử dụng nền tảng tìm kiếm và đặt phòng của chúng tôi.
        </p>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-teal-600" />
            1. Dữ liệu chúng tôi thu thập
          </h2>
          <p className="leading-relaxed">
            Chúng tôi thu thập các thông tin cá nhân do bạn chủ động cung cấp khi sử dụng dịch vụ:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Họ và tên, địa chỉ email, số điện thoại khi bạn đăng ký tài khoản.</li>
            <li>Thông tin về nhu cầu thuê phòng, lịch sử đặt phòng và giao dịch.</li>
            <li>Thông tin hình ảnh và tài liệu định danh phục vụ xác thực người dùng (nếu có).</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-teal-600" />
            2. Cách chúng tôi sử dụng thông tin
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cung cấp và duy trì dịch vụ tìm kiếm, thuê phòng trọ.</li>
            <li>Gửi các thông báo xác thực tài khoản, mã đặt lại mật khẩu và giao dịch liên quan.</li>
            <li>Hỗ trợ xử lý các yêu cầu thuê phòng và phản hồi khiếu nại của khách hàng.</li>
            <li>Nâng cao chất lượng trải nghiệm người dùng trên nền tảng iSinhvien.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-teal-600" />
            3. Bảo mật thông tin của bạn
          </h2>
          <p className="leading-relaxed">
            Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức tối tân để bảo vệ dữ liệu cá nhân của bạn khỏi bị truy cập, tiết lộ trái phép hoặc bị phá hủy. Mật khẩu của bạn được mã hóa bằng thuật toán băm bảo mật cao trước khi lưu trữ trong cơ sở dữ liệu.
          </p>
        </section>
      </div>
    </div>
  );
};
