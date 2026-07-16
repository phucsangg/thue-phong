
export const Footer = () => {
  return (
    <footer className="bg-brand-navy-950 border-t border-brand-navy-800 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <div className="flex items-center gap-2.5 group">
              <svg className="h-10 w-10 shrink-0 transform transition-transform group-hover:rotate-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 25 50 C 25 22, 75 22, 75 50 C 75 62, 58 75, 45 75" stroke="#f15a24" strokeWidth="11" strokeLinecap="round" />
                <path d="M 75 50 C 75 78, 25 78, 25 50 C 25 38, 42 25, 55 25" stroke="#0072bc" strokeWidth="11" strokeLinecap="round" />
              </svg>
              <div className="flex flex-col leading-none text-left">
                <span className="text-xl font-black tracking-tight">
                  <span className="text-[#0072bc]">i</span>
                  <span className="text-[#f15a24]">Student</span>
                </span>
                <span className="text-[8px] font-bold tracking-wider mt-1 flex gap-1">
                  <span className="text-[#f15a24]">Giá tốt hơn</span>
                  <span className="text-[#0072bc]">| Chất lượng hơn</span>
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} iStudent. Bảo lưu mọi quyền. Nền tảng thuê phòng trọ sinh viên tiện ích và an toàn.
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
