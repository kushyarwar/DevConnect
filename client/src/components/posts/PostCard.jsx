import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChat,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineDotsHorizontal,
} from 'react-icons/hi';
import { likePost, unlikePost, savePost, unsavePost, deletePost } from '../../features/posts/postsSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [showMenu, setShowMenu] = useState(false);

  const isAuthor = currentUser?._id === post.author?._id;
  const likeCount = post.likeCount ?? post.likes?.length ?? 0;
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;

  const handleLike = async (e) => {
    e.stopPropagation();
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

  const handleSave = async (e) => {
    e.stopPropagation();
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

  const handleEdit = (e) => {
    e.stopPropagation(); // Stop clicking the card background
    setShowMenu(false);  // Close the menu
    navigate(`/post/edit/${post._id}`); // Go to Edit Page
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(post._id)).unwrap();
        toast.success('Post deleted');
      } catch (error) {
        toast.error(error);
      }
    }
    setShowMenu(false);
  };

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="p-4 border-b border-dark-800 hover:bg-dark-900/50 transition-colors cursor-pointer"
    >
      <div className="flex space-x-3">
        {/* Avatar */}
        <Link
          to={`/profile/${post.author?._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <img
            src={post.author?.avatar?.url || `https://ui-avatars.com/api/?name=${post.author?.username}&background=6366f1&color=fff`}
            alt={post.author?.username}
            className="w-12 h-12 avatar hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <Link
                to={`/profile/${post.author?._id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-dark-100 hover:underline truncate"
              >
                {post.author?.name}
              </Link>
              <Link
                to={`/profile/${post.author?._id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-dark-500 truncate"
              >
                @{post.author?.username}
              </Link>
              <span className="text-dark-600">·</span>
              <span className="text-dark-500 text-sm whitespace-nowrap">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Menu */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 text-dark-500 hover:text-dark-300 hover:bg-dark-800 rounded-full transition-colors"
                >
                  <HiOutlineDotsHorizontal className="w-5 h-5" />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <div className="absolute right-0 mt-1 w-32 py-1 bg-dark-900 border border-dark-700 rounded-lg shadow-xl z-20 animate-fade-in">

                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center px-3 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
                      >
                        <HiOutlinePencil className="w-4 h-4 mr-2" />
                        Edit
                      </button>

                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-dark-800 transition-colors"
                      >
                        <HiOutlineTrash className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post content */}
          <p className="mt-2 text-dark-100 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Image */}
          {post.image?.url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-dark-800">
              <img
                src={post.image.url}
                alt="Post attachment"
                className="w-full h-auto max-h-[600px] object-contain bg-black/50"
              />
            </div>
          )}

          {/* Code snippet */}
          {post.codeSnippet?.code && (
            <div className="mt-3">
              <div className="flex items-center justify-between px-3 py-2 bg-dark-950 border border-dark-800 rounded-t-lg">
                <span className="text-xs text-dark-500 font-mono">
                  {post.codeSnippet.language || 'code'}
                </span>
              </div>
              <pre className="p-3 bg-dark-950 border border-t-0 border-dark-800 rounded-b-lg overflow-x-auto">
                <code className="text-sm text-dark-200">{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-primary-400 text-sm hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked
                  ? 'text-red-500'
                  : 'text-dark-500 hover:text-red-500'
              }`}
            >
              {post.isLiked ? (
                <HiHeart className="w-5 h-5" />
              ) : (
                <HiOutlineHeart className="w-5 h-5" />
              )}
              <span className="text-sm">{likeCount}</span>
            </button>

            <button className="flex items-center space-x-2 text-dark-500 hover:text-primary-400 transition-colors">
              <HiOutlineChat className="w-5 h-5" />
              <span className="text-sm">{commentCount}</span>
            </button>

            <button
              onClick={handleSave}
              className={`transition-colors ${
                post.isSaved
                  ? 'text-primary-400'
                  : 'text-dark-500 hover:text-primary-400'
              }`}
            >
              {post.isSaved ? (
                <HiBookmark className="w-5 h-5" />
              ) : (
                <HiOutlineBookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;