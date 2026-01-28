import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, selectFeedPosts } from '../features/posts/postsSlice';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import MobileWhoToFollow from '../components/users/MobileWhoToFollow';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectFeedPosts);
  const { isFeedLoading, feedPagination } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeedPosts({ page: 1, reset: true }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!isFeedLoading && feedPagination.hasMore) {
      dispatch(fetchFeedPosts({ page: feedPagination.page + 1 }));
    }
  }, [dispatch, isFeedLoading, feedPagination]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  return (
    <div className="w-full">

      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-dark-800 backdrop-blur-md bg-dark-950/80">
        <h1 className="px-6 py-4 text-xl font-bold text-dark-100">Home</h1>
      </div>

      {/* Create Post */}
      <div className="px-0 sm:px-0">
        <CreatePost />
      </div>

      <div className="px-4 mt-2">
         <MobileWhoToFollow />
      </div>

      {/* Posts Feed */}
      <div>
        {posts.length === 0 && !isFeedLoading ? (
          <div className="p-8 text-center">
            <p className="text-dark-500 text-lg">No posts yet</p>
            <p className="text-dark-600 mt-2">
              Follow some developers or create your first post!
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        {isFeedLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!feedPagination.hasMore && posts.length > 0 && (
          <div className="p-8 text-center text-dark-500">
            You've reached the end
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;