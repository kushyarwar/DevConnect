import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiOutlineSearch, 
  HiOutlineBell, 
  HiOutlineLogout, 
  HiOutlineCog,
  HiCode,
  HiX 
} from 'react-icons/hi';

import { selectCurrentUser, logoutUser } from '../../features/auth/authSlice';
import { 
  selectUnreadCount, 
  fetchUnreadCount 
} from '../../features/notifications/notificationsSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const unreadCount = useSelector(selectUnreadCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {showMobileSearch ? (
            <form onSubmit={handleSearch} className="flex-1 flex items-center animate-fade-in">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-dark-900 border border-dark-700 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button 
                type="button" 
                onClick={() => setShowMobileSearch(false)}
                className="ml-2 p-2 text-dark-400 hover:text-white"
              >
                <HiX className="w-6 h-6" />
              </button>
            </form>
          ) : (
            <>
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20">
                  <HiCode className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  DevConnect
                </span>
              </Link>

              <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl mx-8">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search developers, posts..."
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-full
                              text-dark-100 placeholder-dark-500 text-sm
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-3">

                <button 
                  onClick={() => setShowMobileSearch(true)} 
                  className="md:hidden p-2 text-dark-400 hover:text-white transition-colors"
                >
                  <HiOutlineSearch className="w-6 h-6" />
                </button>

                <Link
                  to="/notifications"
                  className="relative p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <HiOutlineBell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-primary-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 p-1 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <img
                      src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff`}
                      alt={user?.username}
                      className="w-8 h-8 avatar"
                    />
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 py-2 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-20 animate-fade-in">
                        <Link
                          to={`/profile/${user?._id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
                        >
                          <img
                            src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff`}
                            alt={user?.username}
                            className="w-8 h-8 avatar mr-3"
                          />
                          <div>
                            <p className="font-medium text-sm">{user?.name}</p>
                            <p className="text-xs text-dark-500">@{user?.username}</p>
                          </div>
                        </Link>
                        <hr className="my-2 border-dark-700" />
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-2 text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors"
                        >
                          <HiOutlineCog className="w-5 h-5 mr-3" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-dark-800 transition-colors"
                        >
                          <HiOutlineLogout className="w-5 h-5 mr-3" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;