import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  currentProfile: null,
  followers: [],
  following: [],
  searchResults: [],
  suggestions: [],
  isLoading: false,
  error: null,
};

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch profile'
      );
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update profile'
      );
    }
  }
);

// Update avatar
export const updateAvatar = createAsyncThunk(
  'users/updateAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.avatar;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update avatar'
      );
    }
  }
);

// Follow user
export const followUser = createAsyncThunk(
  'users/follow',
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/follow`);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to follow user'
      );
    }
  }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'users/unfollow',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/follow`);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to unfollow user'
      );
    }
  }
);

// Fetch followers
export const fetchFollowers = createAsyncThunk(
  'users/fetchFollowers',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/followers?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch followers'
      );
    }
  }
);

// Fetch following
export const fetchFollowing = createAsyncThunk(
  'users/fetchFollowing',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/following?page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch following'
      );
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'users/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Search failed'
      );
    }
  }
);

// Fetch suggestions
export const fetchSuggestions = createAsyncThunk(
  'users/fetchSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/suggestions');
      return response.data.suggestions;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch suggestions'
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.currentProfile = { ...state.currentProfile, ...action.payload };
      })
      // Update Avatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.currentProfile) {
          state.currentProfile.avatar = action.payload;
        }
      })
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.currentProfile && state.currentProfile._id === action.payload) {
          state.currentProfile.isFollowing = true;
          state.currentProfile.followerCount = (state.currentProfile.followerCount || 0) + 1;
        }
        state.suggestions = state.suggestions.filter((u) => u._id !== action.payload);
      })
      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.currentProfile && state.currentProfile._id === action.payload) {
          state.currentProfile.isFollowing = false;
          state.currentProfile.followerCount = Math.max(0, (state.currentProfile.followerCount || 1) - 1);
        }
      })
      // Fetch Followers
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload.followers;
      })
      // Fetch Following
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload.following;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Suggestions
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const { clearCurrentProfile, clearSearchResults, clearError } = usersSlice.actions;

export const selectCurrentProfile = (state) => state.users.currentProfile;
export const selectFollowers = (state) => state.users.followers;
export const selectFollowing = (state) => state.users.following;
export const selectSearchResults = (state) => state.users.searchResults;
export const selectSuggestions = (state) => state.users.suggestions;
export const selectUsersLoading = (state) => state.users.isLoading;

export default usersSlice.reducer;
