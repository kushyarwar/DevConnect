import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { 
  HiHome, 
  HiOutlineHome,
  HiFire,        
  HiOutlineFire, 
  HiUser, 
  HiOutlineUser,
  HiCog, 
  HiOutlineCog 
} from 'react-icons/hi';

const BottomNav = () => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/',
      icon: isActive('/') ? HiHome : HiOutlineHome,
      label: 'Home'
    },
    {
      path: '/explore',
      icon: isActive('/explore') ? HiFire : HiOutlineFire,
      label: 'Trending'
    },
    {
      path: `/profile/${user?._id}`,
      icon: isActive(`/profile/${user?._id}`) ? HiUser : HiOutlineUser,
      label: 'Profile'
    },
    {
      path: '/settings',
      icon: isActive('/settings') ? HiCog : HiOutlineCog,
      label: 'Settings'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-t border-dark-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive(item.path) ? 'text-primary-500' : 'text-dark-400'
              }`}
            >
              <Icon className="w-7 h-7" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;