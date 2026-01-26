import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo192 from '../../../assets/favicon_io/android-chrome-192x192.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleLogin = () => {
    window.open('/ehub', '_blank');
    setIsOpen(false);
  };

  const handleHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Header - transparent with scroll effect */}
      <header className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={logo192}
              alt="SBA Logo" 
              className="w-12 h-12 cursor-pointer"
              onClick={handleHome}
            />
          </div>

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
                onClick={() => scrollToSection('courses')} 
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

          <button 
            onClick={handleLogin}
            className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors"
          >
            Login
          </button>
        </nav>
      </header>

      {/* Mobile Header - simple white background, always visible */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <nav className="px-4 py-2 flex items-center justify-between">
          <img 
            src={logo192}
            alt="SBA Logo" 
            className="w-10 h-10"
            onClick={handleHome}
          />

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
        </nav>

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
                  onClick={() => scrollToSection('courses')} 
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
              <li className="pt-2">
                <button 
                  onClick={handleLogin}
                  className="w-full bg-black text-white px-5 py-2 rounded-full font-bold"
                >
                  Login
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;