import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
  selectCurrentProfile,
  selectUsersLoading,
} from '../features/users/usersSlice';
import { fetchUserPosts, selectUserPosts } from '../features/posts/postsSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import PostCard from '../components/posts/PostCard';
import {
  HiOutlineLocationMarker,
  HiOutlineLink,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const profile = useSelector(selectCurrentProfile);
  const posts = useSelector(selectUserPosts);
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectUsersLoading);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    dispatch(fetchUserProfile(userId));
    dispatch(fetchUserPosts({ userId }));
  }, [dispatch, userId]);

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await dispatch(unfollowUser(userId)).unwrap();
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await dispatch(followUser(userId)).unwrap();
        toast.success(`Following @${profile.username}`);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700" />

      {/* Profile Info */}
      <div className="px-4">
        <div className="relative -mt-16 pb-4 border-b border-dark-800">
          <div className="flex justify-between items-end">
            <img
              src={profile.avatar?.url || `https://ui-avatars.com/api/?name=${profile.username}&background=6366f1&color=fff&size=128`}
              alt={profile.username}
              className="w-32 h-32 avatar border-4 border-dark-950"
            />
            
            <div className="pb-4">
              {isOwnProfile ? (
                <Link to="/settings" className="btn-secondary">
                  Edit profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={profile.isFollowing ? 'btn-secondary' : 'btn-primary'}
                >
                  {isFollowLoading ? '...' : profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-dark-100">{profile.name}</h1>
            <p className="text-dark-500">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="mt-3 text-dark-200 whitespace-pre-wrap">{profile.bio}</p>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Meta info */}
          <div className="mt-4 flex flex-wrap gap-4 text-dark-500 text-sm">
            {profile.location && (
              <div className="flex items-center space-x-1">
                <HiOutlineLocationMarker className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-primary-400 transition-colors"
              >
                <HiOutlineLink className="w-4 h-4" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center space-x-1">
              <HiOutlineCalendar className="w-4 h-4" />
              <span>Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</span>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-3 flex space-x-4">
            {profile.github && (
              <a
                href={`https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-dark-200 transition-colors"
              >
                <FaGithub className="w-5 h-5" />
              </a>
            )}
            {profile.twitter && (
              <a
                href={`https://twitter.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-dark-200 transition-colors"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-dark-200 transition-colors"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex space-x-6">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-dark-100">{profile.followingCount || 0}</span>
              <span className="text-dark-500">Following</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-dark-100">{profile.followerCount || 0}</span>
              <span className="text-dark-500">Followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-dark-100">{profile.postCount || 0}</span>
              <span className="text-dark-500">Posts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-500 hover:text-dark-300'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'likes'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-500 hover:text-dark-300'
            }`}
          >
            Likes
          </button>
        </div>
      </div>

      {/* Posts */}
      <div>
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-dark-500">
                No posts yet
              </div>
            ) : (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
          </>
        )}
        {activeTab === 'likes' && (
          <div className="p-8 text-center text-dark-500">
            Liked posts coming soon
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
