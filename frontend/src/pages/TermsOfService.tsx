import { Scale, Users, AlertCircle, FileCheck } from 'lucide-react';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-inter text-slate-700 text-left">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Scale className="w-10 h-10 text-[#0072bc]" />
          <div>
            <h1 className="text-3xl font-black text-brand-navy-950">Điều khoản dịch vụ</h1>
            <p className="text-sm text-slate-400 font-semibold mt-1">Cập nhật lần cuối: 17 tháng 7, 2026</p>
          </div>
        </div>

        <p className="text-base leading-relaxed">
          Bằng việc đăng ký tài khoản hoặc sử dụng bất kỳ phần nào của nền tảng <strong>iSinhvien</strong>, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ dưới đây. Nếu bạn không đồng ý với các điều khoản này, vui lòng ngừng sử dụng dịch vụ của chúng tôi.
        </p>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-teal-600" />
            1. Tài khoản người dùng
          </h2>
          <p className="leading-relaxed">
            Bạn phải cung cấp thông tin chính xác, đầy đủ và luôn cập nhật thông tin tài khoản của mình. Bạn chịu trách nhiệm bảo mật mật khẩu của mình và cho tất cả các hoạt động diễn ra dưới tài khoản của bạn.
          </p>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-teal-600" />
            2. Quy định về tin đăng và đặt phòng
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Người cho thuê phải đảm bảo thông tin phòng, hình ảnh và giá cả đăng tải là trung thực, chính xác.</li>
            <li>Khách thuê phải tuân thủ nội quy phòng trọ và thực hiện nghĩa vụ thanh toán đầy đủ cho chủ phòng theo hợp đồng thỏa thuận.</li>
            <li>iSinhvien chỉ đóng vai trò là nền tảng kết nối trung gian và không chịu trách nhiệm pháp lý trực tiếp đối với các tranh chấp phát sinh giữa chủ nhà và khách thuê phòng.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xl font-extrabold text-brand-navy-950 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-teal-600" />
            3. Giới hạn trách nhiệm
          </h2>
          <p className="leading-relaxed">
            Chúng tôi nỗ lực tối đa để đảm bảo sự ổn định của hệ thống. Tuy nhiên, dịch vụ được cung cấp trên cơ sở &quot;hiện có&quot; và chúng tôi không đảm bảo rằng dịch vụ sẽ không bao giờ bị gián đoạn hoặc không có lỗi kỹ thuật ngoài ý muốn.
          </p>
        </section>
      </div>
    </div>
  );
};
