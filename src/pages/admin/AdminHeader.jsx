import { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';
import { LogOut, ChevronDown, Shield } from 'lucide-react';

function AdminHeader({ adminData, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = () => {
    if (adminData?.firstName && adminData?.lastName) {
      return `${adminData.firstName[0]}${adminData.lastName[0]}`.toUpperCase();
    }
    return auth.currentUser?.email?.[0]?.toUpperCase() || 'A';
  };

  const getDisplayName = () => {
    if (adminData?.firstName && adminData?.lastName) {
      return `${adminData.firstName} ${adminData.lastName}`;
    }
    return auth.currentUser?.email || 'Admin';
  };

  return (
    <>
      {/* Desktop Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logo192}
              alt="Admin Logo" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Administrator Access
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-1 pr-3 py-1 transition-all"
              >
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  {getInitials()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 mt-1">{auth.currentUser?.email}</p>
                    <p className="text-xs text-blue-600 mt-1 font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Administrator
                    </p>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
}

export default AdminHeader;