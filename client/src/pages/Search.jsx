import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, selectSearchResults, selectUsersLoading, clearSearchResults } from '../features/users/usersSlice';
import { HiOutlineSearch } from 'react-icons/hi';

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = useSelector(selectSearchResults);
  const isLoading = useSelector(selectUsersLoading);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query && query.length >= 2) {
      dispatch(searchUsers(query));
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim() && searchInput.length >= 2) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="w-full">
      
      {/* Header - Search Bar */}
      <div className="hidden md:block sticky top-16 z-10 glass border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search developers by name, username, or skills..."
                className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-xl
                           text-dark-100 placeholder-dark-500
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        {query && (
          <p className="text-dark-500 mb-4">
            {isLoading
              ? 'Searching...'
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="block card-hover p-4 bg-dark-900/50 rounded-xl border border-dark-800 hover:border-dark-700 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
                    alt={user.username}
                    className="w-14 h-14 avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark-100 truncate">{user.name}</p>
                    <p className="text-dark-500 truncate">@{user.username}</p>
                    {user.bio && (
                      <p className="text-dark-400 text-sm mt-1 line-clamp-2">{user.bio}</p>
                    )}
                    {user.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="badge-secondary text-xs">
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 5 && (
                          <span className="badge-secondary text-xs">
                            +{user.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <p className="text-dark-500 text-lg">No results found</p>
            <p className="text-dark-600 mt-2">
              Try searching for a different term
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <HiOutlineSearch className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-dark-500 text-lg">Search for developers</p>
            <p className="text-dark-600 mt-2">
              Find developers by name, username, or skills
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;