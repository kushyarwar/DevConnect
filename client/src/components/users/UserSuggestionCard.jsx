import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { followUser } from '../../features/users/usersSlice';
import toast from 'react-hot-toast';

const UserSuggestionCard = ({ user }) => {
  const dispatch = useDispatch();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      await dispatch(followUser(user._id)).unwrap();
      setIsFollowing(true);
      toast.success(`Following @${user.username}`);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFollowing) return null;

  return (
    <Link
      to={`/profile/${user._id}`}
      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-800 transition-colors"
    >
      <img
        src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
        alt={user.username}
        className="w-10 h-10 avatar"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-dark-100 truncate">{user.name}</p>
        <p className="text-sm text-dark-500 truncate">@{user.username}</p>
      </div>
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className="btn-secondary text-sm py-1.5 px-4"
      >
        {isLoading ? '...' : 'Follow'}
      </button>
    </Link>
  );
};

export default UserSuggestionCard;
