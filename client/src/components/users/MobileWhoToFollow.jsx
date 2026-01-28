import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSuggestions, 
  followUser, 
  selectSuggestions, 
  selectUsersLoading 
} from '../../features/users/usersSlice';
import { HiUserAdd } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MobileWhoToFollow = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectSuggestions);
  const isLoading = useSelector(selectUsersLoading);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const handleFollow = async (userId, name) => {
    try {
      await dispatch(followUser(userId)).unwrap();
      toast.success(`You are now following ${name}`);
    } catch (error) {
      toast.error('Failed to follow user');
    }
  };

  if (isLoading || !users || users.length === 0) return null;

  return (
    <div className="block xl:hidden mb-6 -mx-4 w-[calc(100%+2rem)]">
      
      <h3 className="text-dark-200 font-bold mb-3 px-4 text-sm uppercase tracking-wide">
        Who to follow
      </h3>
      
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 hide-scrollbar snap-x">
        {users.map((user) => (
          <div 
            key={user._id} 
            className="shrink-0 w-[160px] bg-dark-900/50 border border-dark-800 rounded-xl p-4 flex flex-col items-center text-center snap-center hover:border-dark-700 transition-colors"
          >
            {/* Avatar */}
            <Link to={`/profile/${user._id}`}>
              <img
                src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
                alt={user.username}
                className="w-12 h-12 avatar mb-2"
              />
            </Link>

            {/* Name & Username */}
            <Link to={`/profile/${user._id}`} className="mb-3 w-full">
              <p className="text-dark-100 font-semibold text-sm truncate w-full">
                {user.name}
              </p>
              <p className="text-dark-500 text-xs truncate w-full">
                @{user.username}
              </p>
            </Link>

            {/* Follow Button */}
            <button
              onClick={() => handleFollow(user._id, user.name)}
              className="mt-auto w-full py-1.5 px-3 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              <HiUserAdd className="w-3 h-3" />
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileWhoToFollow;