const express = require('express');
const CommunityPost = require('../models/CommunityPost');
const Adventure = require('../models/Adventure');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all community posts with pagination  
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const posts = await CommunityPost.find()
      .populate('userId', 'username')
      .populate('adventureId', 'destination places options')
      .populate('comments.userId', 'username')
      .populate('comments.replies.userId', 'username')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await CommunityPost.countDocuments();

    const response = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Create a new community post
router.post('/', auth, async (req, res) => {
  try {
    const { title, story, adventureId, media, tags } = req.body;
    
    if (adventureId) {
      const adventure = await Adventure.findOne({
        _id: adventureId,
        userId: req.user._id
      });
      
      if (!adventure) {
        return res.status(404).json({ message: 'Adventure not found' });
      }
    }

    const post = new CommunityPost({
      userId: req.user._id,
      title,
      story,
      adventureId: adventureId || null,
      media: media || [],
      tags: tags || []
    });

    await post.save();
    
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('userId', 'username')
      .populate('adventureId', 'destination places options');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Like/unlike a post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Add comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      userId: req.user._id,
      text
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await CommunityPost.findById(req.params.id)
      .populate('comments.userId', 'username');
    
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Like/unlike a comment
router.put('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: comment.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Reply to a comment
router.post('/:postId/comments/:commentId/replies', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await CommunityPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      userId: req.user._id,
      text
    };

    comment.replies.push(reply);
    await post.save();

    const updatedPost = await CommunityPost.findById(req.params.postId)
      .populate('comments.replies.userId', 'username');
    
    const updatedComment = updatedPost.comments.id(req.params.commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];
    
    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Like/unlike a reply
router.put('/:postId/comments/:commentId/replies/:replyId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.indexOf(req.user._id);
    
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: reply.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Delete a post (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;