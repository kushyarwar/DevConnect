import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  selectNotifications,
  selectNotificationsLoading,
} from '../features/notifications/notificationsSlice';
import { HiOutlineHeart, HiOutlineChat, HiOutlineUserAdd, HiOutlineCheck } from 'react-icons/hi';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'like':
      return <HiOutlineHeart className="w-5 h-5 text-red-500" />;
    case 'comment':
      return <HiOutlineChat className="w-5 h-5 text-primary-400" />;
    case 'follow':
      return <HiOutlineUserAdd className="w-5 h-5 text-green-500" />;
    default:
      return null;
  }
};

const getNotificationText = (notification) => {
  switch (notification.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    case 'mention':
      return 'mentioned you';
    default:
      return '';
  }
};

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const isLoading = useSelector(selectNotificationsLoading);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div>
      {/* Header */}
      <div className="sticky top-16 z-10 glass border-b border-dark-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-dark-100">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center space-x-1"
            >
              <HiOutlineCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div>
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-dark-500 text-lg">No notifications yet</p>
            <p className="text-dark-600 mt-2">
              When someone interacts with your posts, you'll see it here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => !notification.read && handleMarkAsRead(notification._id)}
              className={`p-4 border-b border-dark-800 hover:bg-dark-900/50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-primary-900/10' : ''
              }`}
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start space-x-2">
                    <Link
                      to={`/profile/${notification.sender?._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={notification.sender?.avatar?.url || `https://ui-avatars.com/api/?name=${notification.sender?.username}&background=6366f1&color=fff`}
                        alt={notification.sender?.username}
                        className="w-10 h-10 avatar hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1">
                      <p className="text-dark-200">
                        <Link
                          to={`/profile/${notification.sender?._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-dark-100 hover:underline"
                        >
                          {notification.sender?.name}
                        </Link>{' '}
                        {getNotificationText(notification)}
                      </p>

                      {notification.content && (
                        <p className="mt-1 text-dark-500 text-sm line-clamp-2">
                          "{notification.content}"
                        </p>
                      )}

                      <p className="mt-1 text-dark-600 text-sm">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
