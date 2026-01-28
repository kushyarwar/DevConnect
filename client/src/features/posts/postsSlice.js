import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  feedPosts: [],
  explorePosts: [],
  currentPost: null,
  userPosts: [],
  savedPosts: [],
  isLoading: false,
  isFeedLoading: false,
  isExploreLoading: false,
  error: null,
  feedPagination: { page: 1, hasMore: true },
  explorePagination: { page: 1, hasMore: true },
};

// Fetch feed posts
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, reset = false }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts?page=${page}&limit=10`);
      return { ...response.data, reset };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch posts'
      );
    }
  }
);

// Fetch explore/trending posts
export const fetchExplorePosts = createAsyncThunk(
  'posts/fetchExplore',
  async ({ page = 1, timeRange = '24h', reset = false }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/explore?page=${page}&limit=10&timeRange=${timeRange}`);
      return { ...response.data, reset };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch posts'
      );
    }
  }
);

// Fetch single post
export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data.post;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch post'
      );
    }
  }
);

// Fetch user posts
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/user/${userId}?page=${page}&limit=10`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch posts'
      );
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.post;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create post'
      );
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.post;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update post'
      );
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete post'
      );
    }
  }
);

// Like post
export const likePost = createAsyncThunk(
  'posts/like',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, likeCount: response.data.likeCount };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to like post'
      );
    }
  }
);

// Unlike post
export const unlikePost = createAsyncThunk(
  'posts/unlike',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/posts/${postId}/like`);
      return { postId, likeCount: response.data.likeCount };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to unlike post'
      );
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to add comment'
      );
    }
  }
);

// Save post
export const savePost = createAsyncThunk(
  'posts/save',
  async (postId, { rejectWithValue }) => {
    try {
      await api.post(`/posts/${postId}/save`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to save post'
      );
    }
  }
);

// Unsave post
export const unsavePost = createAsyncThunk(
  'posts/unsave',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}/save`);
      return postId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to unsave post'
      );
    }
  }
);

// Fetch saved posts
export const fetchSavedPosts = createAsyncThunk(
  'posts/fetchSaved',
  async ({ page = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/saved?page=${page}&limit=10`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch saved posts'
      );
    }
  }
);

const updatePostInList = (posts, postId, updates) => {
  return posts.map((post) =>
    post._id === postId ? { ...post, ...updates } : post
  );
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearUserPosts: (state) => {
      state.userPosts = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Feed Posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isFeedLoading = true;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isFeedLoading = false;
        if (action.payload.reset) {
          state.feedPosts = action.payload.posts;
        } else {
          state.feedPosts = [...state.feedPosts, ...action.payload.posts];
        }
        state.feedPagination = {
          page: action.payload.pagination.page,
          hasMore: action.payload.pagination.hasMore,
        };
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isFeedLoading = false;
        state.error = action.payload;
      })
      // Fetch Explore Posts
      .addCase(fetchExplorePosts.pending, (state) => {
        state.isExploreLoading = true;
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.isExploreLoading = false;
        if (action.payload.reset) {
          state.explorePosts = action.payload.posts;
        } else {
          state.explorePosts = [...state.explorePosts, ...action.payload.posts];
        }
        state.explorePagination = {
          page: action.payload.pagination.page,
          hasMore: action.payload.pagination.hasMore,
        };
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        state.isExploreLoading = false;
        state.error = action.payload;
      })
      // Fetch Single Post
      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch User Posts
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload.posts;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = [action.payload, ...state.feedPosts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const postId = action.payload._id;
        state.feedPosts = state.feedPosts.map(post => post._id === postId ? action.payload : post);
        state.explorePosts = state.explorePosts.map(post => post._id === postId ? action.payload : post);
        state.userPosts = state.userPosts.map(post => post._id === postId ? action.payload : post);
        if (state.currentPost?._id === postId) {
            state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.feedPosts = state.feedPosts.filter((p) => p._id !== action.payload);
        state.explorePosts = state.explorePosts.filter((p) => p._id !== action.payload);
        state.userPosts = state.userPosts.filter((p) => p._id !== action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likeCount } = action.payload;
        const updates = { isLiked: true, likeCount, likes: { length: likeCount } };
        state.feedPosts = updatePostInList(state.feedPosts, postId, updates);
        state.explorePosts = updatePostInList(state.explorePosts, postId, updates);
        if (state.currentPost?._id === postId) {
          state.currentPost = { ...state.currentPost, ...updates };
        }
      })
      // Unlike Post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, likeCount } = action.payload;
        const updates = { isLiked: false, likeCount, likes: { length: likeCount } };
        state.feedPosts = updatePostInList(state.feedPosts, postId, updates);
        state.explorePosts = updatePostInList(state.explorePosts, postId, updates);
        if (state.currentPost?._id === postId) {
          state.currentPost = { ...state.currentPost, ...updates };
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.currentPost?._id === postId) {
          state.currentPost.comments = [...state.currentPost.comments, comment];
        }
      })
      // Save Post
      .addCase(savePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.feedPosts = updatePostInList(state.feedPosts, postId, { isSaved: true });
        state.explorePosts = updatePostInList(state.explorePosts, postId, { isSaved: true });
        
        // Update currentPost if we are viewing it
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isSaved = true;
        }
      })
      // Unsave Post
      .addCase(unsavePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.feedPosts = updatePostInList(state.feedPosts, postId, { isSaved: false });
        state.explorePosts = updatePostInList(state.explorePosts, postId, { isSaved: false });
        state.savedPosts = state.savedPosts.filter((p) => p._id !== postId);
        
        // Update currentPost if we are viewing it
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isSaved = false;
        }
      })
      // Fetch Saved Posts
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.savedPosts = action.payload.posts;
      });
  },
});

export const { clearCurrentPost, clearUserPosts, clearError } = postsSlice.actions;

export const selectFeedPosts = (state) => state.posts.feedPosts;
export const selectExplorePosts = (state) => state.posts.explorePosts;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectUserPosts = (state) => state.posts.userPosts;
export const selectSavedPosts = (state) => state.posts.savedPosts;
export const selectPostsLoading = (state) => state.posts.isLoading;

export default postsSlice.reducer;