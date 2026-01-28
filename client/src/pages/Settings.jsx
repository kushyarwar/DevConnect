import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, updateUser } from '../features/auth/authSlice';
import { updateProfile, updateAvatar } from '../features/users/usersSlice';
import { HiOutlineCamera } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await dispatch(updateAvatar(formData)).unwrap();
      dispatch(updateUser({ avatar: result }));
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error(error || 'Failed to update avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const result = await dispatch(updateProfile(updateData)).unwrap();
      dispatch(updateUser(result));
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100">Settings</h1>
        <p className="text-dark-500 mt-1">Manage your account settings</p>
      </div>

      {/* Avatar Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-100 mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff&size=96`}
              alt={user?.username}
              className="w-24 h-24 avatar"
            />
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-dark-900/80 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="btn-secondary flex items-center space-x-2"
            >
              <HiOutlineCamera className="w-5 h-5" />
              <span>Change photo</span>
            </button>
            <p className="text-dark-500 text-sm mt-2">JPG, PNG, GIF up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="card p-6">
        <h2 className="text-lg font-semibold text-dark-100 mb-6">Profile Information</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-300 mb-2">Display Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input" placeholder="Your name" />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-dark-300 mb-2">Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} maxLength={500} className="input resize-none" placeholder="Tell us about yourself..." />
            <p className="text-dark-500 text-sm mt-1">{formData.bio.length}/500</p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-dark-300 mb-2">Location</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="input" placeholder="San Francisco, CA" />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-dark-300 mb-2">Website</label>
            <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} className="input" placeholder="https://yourwebsite.com" />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-dark-300 mb-2">Skills</label>
            <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} className="input" placeholder="React, Node.js, Python (comma separated)" />
          </div>

          <hr className="border-dark-700" />

          <h3 className="text-md font-medium text-dark-200">Social Links</h3>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-dark-300 mb-2">GitHub Username</label>
            <input type="text" id="github" name="github" value={formData.github} onChange={handleChange} className="input" placeholder="username" />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-dark-300 mb-2">Twitter Username</label>
            <input type="text" id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} className="input" placeholder="username" />
          </div>

          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-dark-300 mb-2">LinkedIn URL</label>
            <input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} className="input" placeholder="https://linkedin.com/in/username" />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary px-8">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;