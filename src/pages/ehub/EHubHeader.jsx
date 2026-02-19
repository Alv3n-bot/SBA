import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';
import { LogOut, Menu, X, Settings as SettingsIcon, Bell, ChevronDown } from 'lucide-react';

function EHubHeader({ userData, onOpenSettings, onOpenNotifications }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time listener for unread notifications
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');

    // Fetch all notifications and filter/count in JavaScript
    const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
      const unreadCount = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(notif => 
          (notif.userId === user.uid || notif.userId === 'all') && 
          notif.read === false
        ).length;
      
      setUnreadCount(unreadCount);
    });

    return () => unsubscribe();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Subscription helper functions
  const isSubscriptionActive = () => {
    if (!userData?.subscription?.endDate) return false;
    const endDate = userData.subscription.endDate.toDate ?
      userData.subscription.endDate.toDate() :
      new Date(userData.subscription.endDate);
    return endDate > new Date();
  };

  const getDaysRemaining = () => {
    if (!userData?.subscription?.endDate) return 0;
    const endDate = userData.subscription.endDate.toDate ?
      userData.subscription.endDate.toDate() :
      new Date(userData.subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return auth.currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return auth.currentUser?.email || 'User';
  };

  return (
    <>
      {/* Desktop Header - transparent with scroll effect */}
      <header className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logo192}
              alt="EHub Logo" 
              className="w-12 h-12 cursor-pointer"
              onClick={handleHome}
            />
        
          </div>

          {/* Center Navigation */}
          <ul className="flex items-center space-x-8">
            <li>
              <button 
                onClick={handleHome}
                className="text-gray-900 font-semibold hover:text-gray-600 transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('courses-section')} 
                className="text-gray-900 font-semibold hover:text-gray-600 transition-colors"
              >
                Courses
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-gray-900 font-semibold hover:text-gray-600 transition-colors"
              >
                About
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-900 font-semibold hover:text-gray-600 transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Right Side - Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-full pl-1 pr-3 py-1 transition-all"
              >
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  {getInitials()}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 mt-1">{auth.currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-semibold"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button 
                    onClick={() => {
                      onOpenNotifications();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-semibold"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={handleLogout}
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

      {/* Mobile Header - simple white background, always visible */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <nav className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logo192}
              alt="EHub Logo" 
              className="w-10 h-10 cursor-pointer"
              onClick={handleHome}
            />
            <h1 className="text-lg font-bold text-gray-900">EHub</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell - Mobile */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar - Mobile with Chevron */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="relative flex items-center gap-1 hover:bg-gray-100 rounded-full pl-1 pr-2 py-1 transition-all"
            >
              <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {getInitials()}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Hamburger Menu */}
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="bg-white border-t border-gray-200">
            <ul className="flex flex-col px-4 py-3">
              <li>
                <button 
                  onClick={handleHome}
                  className="w-full text-left px-3 py-2 text-gray-900 font-semibold"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('courses-section')} 
                  className="w-full text-left px-3 py-2 text-gray-900 font-semibold"
                >
                  Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="w-full text-left px-3 py-2 text-gray-900 font-semibold"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="w-full text-left px-3 py-2 text-gray-900 font-semibold"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Mobile Profile Dropdown */}
        {showProfileMenu && (
          <div className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{getDisplayName()}</p>
              <p className="text-xs text-gray-500 mt-1">{auth.currentUser?.email}</p>
            </div>
            <button
              onClick={() => {
                onOpenSettings();
                setShowProfileMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-semibold"
            >
              <SettingsIcon className="w-4 h-4" />
              Account Settings
            </button>
            <button 
              onClick={() => {
                onOpenNotifications();
                setShowProfileMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 font-semibold"
            >
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="border-t border-gray-200 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-0"></div>
    </>
  );
}

export default EHubHeader;