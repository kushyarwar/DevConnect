import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions, selectSuggestions } from '../../features/users/usersSlice';
import UserSuggestionCard from '../users/UserSuggestionCard'; 

const RightSidebar = () => {
  const dispatch = useDispatch();
  const suggestions = useSelector(selectSuggestions);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  return (
    <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-800 backdrop-blur-sm">
      <h3 className="font-bold text-white mb-4 text-lg">Who to follow</h3>
      <div className="space-y-4">
        {suggestions.map((user) => (
          <UserSuggestionCard key={user._id} user={user} />
        ))}
        
        {suggestions.length === 0 && (
          <p className="text-dark-500 text-sm">No suggestions available</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;