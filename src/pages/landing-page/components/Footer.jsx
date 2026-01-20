import { Facebook, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white py-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <ul className="flex space-x-6 mb-4 md:mb-0">
          <li><a href="#" className="text-gray-600 hover:text-purple-600">Terms of Service</a></li>
          <li><a href="#" className="text-gray-600 hover:text-purple-600">Privacy Policy</a></li>
          <li><a href="#" className="text-gray-600 hover:text-purple-600">FAQ</a></li>
        </ul>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;  