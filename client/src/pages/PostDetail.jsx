import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchPost,
  likePost,
  unlikePost,
  addComment,
  savePost,
  unsavePost,
  selectCurrentPost,
  selectPostsLoading,
  clearCurrentPost,
} from '../features/posts/postsSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import {
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiHeart,
  HiOutlineBookmark, 
  HiBookmark,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const post = useSelector(selectCurrentPost);
  const isLoading = useSelector(selectPostsLoading);
  const currentUser = useSelector(selectCurrentUser);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchPost(postId));
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  const handleLike = async () => {
    try {
      if (post.isLiked) {
        await dispatch(unlikePost(post._id)).unwrap();
      } else {
        await dispatch(likePost(post._id)).unwrap();
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSave = async () => {
    try {
      if (post.isSaved) {
        await dispatch(unsavePost(post._id)).unwrap();
        toast.success('Post removed from saved');
      } else {
        await dispatch(savePost(post._id)).unwrap();
        toast.success('Post saved');
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(addComment({ postId: post._id, content: commentText })).unwrap();
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const likeCount = post.likeCount ?? post.likes?.length ?? 0;
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;

  return (
    <div className="w-full">
      
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-dark-800 backdrop-blur-md bg-dark-950/80">
        <div className="px-4 py-3 flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-800 rounded-full transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5 text-dark-200" />
          </button>
          <h1 className="text-xl font-bold text-dark-100">Post</h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4 border-b border-dark-800">
        <div className="flex space-x-3">
          <Link to={`/profile/${post.author?._id}`}>
            <img
              src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${post.author?.username}&background=6366f1&color=fff`}
              alt={post.author?.username}
              className="w-12 h-12 avatar hover:opacity-80 transition-opacity"
            />
          </Link>

          <div>
            <Link
              to={`/profile/${post.author?._id}`}
              className="font-semibold text-dark-100 hover:underline"
            >
              {post.author?.name}
            </Link>
            <Link
              to={`/profile/${post.author?._id}`}
              className="block text-dark-500"
            >
              @{post.author?.username}
            </Link>
          </div>
        </div>

        <p className="mt-4 text-dark-100 text-xl whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Image */}
        {post.image?.url && (
          <div className="mt-4 rounded-xl overflow-hidden border border-dark-800">
            <img
              src={post.image.url}
              alt="Post attachment"
              className="w-full h-auto max-h-[600px] object-contain bg-black/50"
            />
          </div>
        )}

        {/* Code snippet */}
        {post.codeSnippet?.code && (
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 py-2 bg-dark-950 border border-dark-800 rounded-t-lg">
              <span className="text-xs text-dark-500 font-mono">
                {post.codeSnippet.language || 'code'}
              </span>
            </div>
            <pre className="p-4 bg-dark-950 border border-t-0 border-dark-800 rounded-b-lg overflow-x-auto">
              <code className="text-sm text-dark-200">{post.codeSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-4 text-dark-500">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>

        {/* Stats */}
        <div className="mt-4 py-4 border-y border-dark-800 flex space-x-6 text-dark-300">
          <div>
            <span className="font-bold text-dark-100">{likeCount}</span> Likes
          </div>
          <div>
            <span className="font-bold text-dark-100">{commentCount}</span> Comments
          </div>
        </div>

        <div className="mt-2 flex justify-around py-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
              post.isLiked
                ? 'text-red-500'
                : 'text-dark-500 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            {post.isLiked ? (
              <HiHeart className="w-6 h-6" />
            ) : (
              <HiOutlineHeart className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
              post.isSaved
                ? 'text-primary-400'
                : 'text-dark-500 hover:text-primary-400 hover:bg-primary-400/10'
            }`}
          >
            {post.isSaved ? (
              <HiBookmark className="w-6 h-6" />
            ) : (
              <HiOutlineBookmark className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleComment} className="p-4 border-b border-dark-800">
        <div className="flex space-x-3">
          <img
            src={currentUser?.avatar?.url || `https://ui-avatars.com/api/?name=${currentUser?.username}&background=6366f1&color=fff`}
            alt={currentUser?.username}
            className="w-10 h-10 avatar flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              maxLength={1000}
              className="w-full bg-transparent text-dark-100 placeholder-dark-500 resize-none focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="btn-primary px-6"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments */}
      <div className="pb-20">
        {post.comments?.map((comment) => (
          <div key={comment._id} className="p-4 border-b border-dark-800">
            <div className="flex space-x-3">
              <Link to={`/profile/${comment.user?._id}`}>
                <img
                  src={comment.user?.avatar?.url || `https://ui-avatars.com/api/?name=${comment.user?.username}&background=6366f1&color=fff`}
                  alt={comment.user?.username}
                  className="w-10 h-10 avatar hover:opacity-80 transition-opacity"
                />
              </Link>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/profile/${comment.user?._id}`}
                    className="font-semibold text-dark-100 hover:underline"
                  >
                    {comment.user?.name}
                  </Link>
                  <Link
                    to={`/profile/${comment.user?._id}`}
                    className="text-dark-500"
                  >
                    @{comment.user?.username}
                  </Link>
                  <span className="text-dark-600">·</span>
                  <span className="text-dark-500 text-sm">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-dark-200 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {post.comments?.length === 0 && (
          <div className="p-8 text-center text-dark-500">
            No comments yet. Be the first to reply!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;