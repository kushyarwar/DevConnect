import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, clearError } from '../features/auth/authSlice';
import { HiCode } from 'react-icons/hi';
import { FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa'; // ✅ Icons
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* LEFT SIDE - Desktop Only (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <HiCode className="text-white w-8 h-8" />
            </div>
            <span className="text-3xl font-bold text-white">DevConnect</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Connect with developers worldwide
          </h1>
          <p className="text-xl text-white/80">
            Share your code, learn from others, and build your network in the developer community.
          </p>
        </div>

        {/* Desktop Social Links */}
        <div>
          <p className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">
            Connect with me
          </p>
          <div className="flex items-center gap-6">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-all transform hover:scale-110">
              <FaLinkedin className="w-8 h-8" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-all transform hover:scale-110">
              <FaGithub className="w-8 h-8" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-all transform hover:scale-110">
              <FaInstagram className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo Header */}
          <div className="lg:hidden mb-8 text-center">
             <div className="inline-flex items-center space-x-3">
               <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                 <HiCode className="text-white w-6 h-6" />
               </div>
               <span className="text-2xl font-bold text-gradient">DevConnect</span>
             </div>
          </div>

          <h2 className="text-3xl font-bold text-dark-100 mb-2">Welcome back</h2>
          <p className="text-dark-400 mb-8">Sign in to continue to DevConnect</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="link font-medium">
              Sign up
            </Link>
          </p>

          <div className="mt-12 lg:hidden">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-950 text-dark-400">Connect with me</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-8">
              <a 
                href="https://www.linkedin.com/in/YOUR_LINKEDIN_HERE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
              
              <a 
                href="https://github.com/YOUR_GITHUB_HERE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
              >
                <FaGithub className="w-6 h-6" />
              </a>
              
              <a 
                href="https://instagram.com/YOUR_INSTAGRAM_HERE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          {/* End Mobile Socials */}

        </div>
      </div>
    </div>
  );
};

export default Login;