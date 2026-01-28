import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { HiCode } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 bg-dark-950 mt-auto">
      <div className="flex flex-col items-center justify-center space-y-3">
        
        {/* Social Links */}
        <div className="flex items-center gap-6">
          <a 
            href="https://www.linkedin.com/in/YOUR_LINKEDIN_HERE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-primary-500 transition-colors transform hover:scale-110"
          >
            <FaLinkedin className="w-5 h-5" />
          </a>
          
          <a 
            href="https://github.com/YOUR_GITHUB_HERE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-primary-500 transition-colors transform hover:scale-110"
          >
            <FaGithub className="w-5 h-5" />
          </a>
          
          <a 
            href="https://instagram.com/YOUR_INSTAGRAM_HERE" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-dark-400 hover:text-primary-500 transition-colors transform hover:scale-110"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
        </div>

        {/* Logo & Copyright */}
        <div className="flex items-center space-x-2 opacity-60">
          <HiCode className="w-4 h-4 text-dark-400" />
          <span className="text-xs text-dark-500">
             &copy; {currentYear} DevConnect Inc.
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;