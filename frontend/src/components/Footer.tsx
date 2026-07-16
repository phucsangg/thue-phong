
export const Footer = () => {
  return (
    <footer className="bg-brand-navy-950 border-t border-brand-navy-800 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="bg-brand-teal-600 p-1.5 rounded-lg text-white font-black text-xs">RN</span>
              <span>Rent<span className="text-brand-teal-400">Now</span></span>
            </span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} RentNow Inc. Bảo lưu mọi quyền. Nền tảng thuê phòng cao cấp và bảo mật.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-white transition-colors">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
