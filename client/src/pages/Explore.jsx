import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplorePosts, selectExplorePosts, selectPostsLoading } from '../features/posts/postsSlice';
import PostCard from '../components/posts/PostCard';
import { HiOutlineFire, HiOutlineClock } from 'react-icons/hi';

const TIME_FILTERS = [
  { id: '24h', label: 'Last 24 Hours' },
  { id: '2d', label: 'Last 2 Days' },
  { id: '7d', label: 'This Week' },
  { id: '30d', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const Explore = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectExplorePosts);
  const loading = useSelector(selectPostsLoading);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchExplorePosts({ page: 1, timeRange: activeFilter, reset: true }));
  }, [dispatch, activeFilter]);

  return (
    <div className="w-full">
      
      {/* Header & Filters */}
      <div className="sticky top-0 z-10 glass border-b border-dark-800 backdrop-blur-md bg-dark-950/80">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineFire className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold text-white">Explore Trending</h1>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeFilter === filter.id
                    ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20'
                    : 'bg-dark-900 border-dark-700 text-dark-400 hover:bg-dark-800 hover:text-dark-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mt-2">
        {posts.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineClock className="w-8 h-8 text-dark-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No trending posts</h3>
            <p className="text-dark-500 mt-2">Try selecting a different time range.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {loading && (
          <div className="p-8 flex justify-center">
             <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="py-6 text-center text-dark-500 text-sm">
            You've reached the end
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;