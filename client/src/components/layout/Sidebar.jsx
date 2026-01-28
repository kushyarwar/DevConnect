import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineHome,
  HiOutlineFire,
  HiOutlineUser,
  HiOutlineCog,
} from 'react-icons/hi';
import { selectCurrentUser } from '../../features/auth/authSlice';

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Home' },
  { to: '/explore', icon: HiOutlineFire, label: 'Explore' },
  { to: '/profile/:id', icon: HiOutlineUser, label: 'Profile', dynamic: true },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

const Sidebar = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const to = item.dynamic ? `/profile/${user?._id}` : item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/10 text-primary-400 font-medium'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                }`
              }
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-4 border-t border-dark-800">
          <Link 
            to={`/profile/${user._id}`}
            className="flex items-center space-x-3 p-3 bg-dark-900 rounded-xl hover:bg-dark-800 transition-colors cursor-pointer group"
          >
            <img
              src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
              alt={user.username}
              className="w-10 h-10 avatar group-hover:opacity-80 transition-opacity"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark-100 truncate group-hover:text-primary-400 transition-colors">
                {user.name}
              </p>
              <p className="text-sm text-dark-500 truncate">@{user.username}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;