
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-brand-navy-950 border-t border-brand-navy-800 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="flex items-center group">
              <img src="/logo.png" alt="iSinhvien Logo" className="h-11 w-auto object-contain" />
            </div>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} iSinhvien. Bảo lưu mọi quyền. Nền tảng thuê phòng trọ sinh viên tiện ích và an toàn.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link to="/support" className="hover:text-white transition-colors">Hỗ trợ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
