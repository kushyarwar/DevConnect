import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post cannot exceed 5000 characters']
  },
  image: {
    url: String,
    publicId: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  codeSnippet: {
    code: String,
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'other']
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for engagement score (for trending)
postSchema.virtual('engagementScore').get(function() {
  const likeWeight = 1;
  const commentWeight = 2;
  const likes = this.likes ? this.likes.length : 0;
  const comments = this.comments ? this.comments.length : 0;
  
  // Time decay factor (posts lose relevance over time)
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const timeFactor = Math.pow(0.95, hoursSinceCreation / 24); // Decay daily
  
  return ((likes * likeWeight) + (comments * commentWeight)) * timeFactor;
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'likes': 1 });

// Text index for search
postSchema.index({ content: 'text', tags: 'text' });

// Pre-save hook to extract tags from content
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const matches = this.content.match(hashtagRegex);
    if (matches) {
      this.tags = [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
    }
  }
  next();
});

// Static method to get feed posts
postSchema.statics.getFeed = async function(userId, following, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    author: { $in: [userId, ...following] }
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username name avatar')
    .populate('comments.user', 'username name avatar')
    .lean();
};

// Static method to get trending posts
postSchema.statics.getTrending = async function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $size: { $ifNull: ['$likes', []] } },
            { $multiply: [{ $size: { $ifNull: ['$comments', []] } }, 2] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          { $project: { username: 1, name: 1, avatar: 1 } }
        ]
      }
    },
    { $unwind: '$author' }
  ]);
};

const Post = mongoose.model('Post', postSchema);

export default Post;
