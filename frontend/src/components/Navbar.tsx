import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, FileText, Home } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-[50] text-slate-800 border-b border-slate-200/80 shadow-sm shadow-slate-150/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 hover:scale-102 transition-transform group">
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
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-[#0072bc] transition-colors text-sm font-bold tracking-wide relative group py-2">
              Trang chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0072bc] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/rooms" className="text-slate-600 hover:text-[#0072bc] transition-colors text-sm font-bold tracking-wide relative group py-2">
              Danh sách phòng
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0072bc] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-5">
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="flex items-center gap-1.5 bg-[#0072bc]/5 hover:bg-[#0072bc]/10 px-4 py-1.5 rounded-xl border border-[#0072bc]/15 text-[#0072bc] text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <LayoutDashboard className="w-4 h-4 text-[#0072bc]" />
                    Bảng quản trị
                  </Link>
                )}
                {user?.role === 'USER' && (
                  <Link to="/my-requests" className="flex items-center gap-1.5 text-sm font-bold text-slate-650 hover:text-[#0072bc] transition-colors hover:scale-105 active:scale-95 duration-200">
                    <FileText className="w-4 h-4 text-[#0072bc]" />
                    Yêu cầu thuê
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-1.5 text-sm font-bold text-slate-650 hover:text-[#0072bc] transition-colors hover:scale-105 active:scale-95 duration-200">
                  <UserIcon className="w-4 h-4 text-[#0072bc]" />
                  Hồ sơ cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-500 transition-colors hover:scale-105 active:scale-95 duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link to="/login" className="text-slate-650 hover:text-[#0072bc] transition-colors text-sm font-bold tracking-wide py-2">Đăng nhập</Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-[#0072bc] hover:from-blue-700 hover:to-[#0062a3] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10 hover:scale-105 active:scale-95"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 text-slate-650 hover:text-[#0072bc] focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200/80 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold"
          >
            <Home className="w-4 h-4 text-[#0072bc]" /> Trang chủ
          </Link>
          <Link
            to="/rooms"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold"
          >
            <FileText className="w-4 h-4 text-[#0072bc]" /> Danh sách phòng
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-[#0072bc]/5 rounded-lg text-sm font-bold text-[#0072bc]"
                >
                  <LayoutDashboard className="w-4 h-4" /> Bảng quản trị
                </Link>
              )}
              {user?.role === 'USER' && (
                <Link
                  to="/my-requests"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold"
                >
                  <FileText className="w-4 h-4 text-[#0072bc]" /> Yêu cầu thuê
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold"
              >
                <UserIcon className="w-4 h-4 text-[#0072bc]" /> Hồ sơ cá nhân
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 p-2 hover:bg-rose-50 rounded-lg text-sm font-bold text-rose-600 text-left"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center p-2 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold text-center"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex justify-center bg-[#0072bc] hover:bg-[#0062a3] text-white p-2.5 rounded-lg text-sm font-semibold text-center"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
