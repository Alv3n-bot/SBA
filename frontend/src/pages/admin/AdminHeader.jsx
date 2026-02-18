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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

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
      {/* Desktop & Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-200'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={logo192}
                alt="Admin Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-black">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Administrator
                </p>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-xl pl-1 pr-2 sm:pr-3 py-1 transition-all"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {getInitials()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-black">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b-2 border-gray-200">
                      <p className="text-sm font-bold text-black">{getDisplayName()}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{auth.currentUser?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded-full">
                        <Shield className="w-3 h-3" />
                        <span className="text-xs font-semibold">Administrator</span>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-16 sm:h-20"></div>
    </>
  );
}

export default AdminHeader;