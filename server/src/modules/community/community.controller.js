import { CommunityPost } from '../../models/CommunityPost.js';
import { Comment } from '../../models/Comment.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listPosts = async (req, res, next) => {
  try {
    const { category, search, tag } = req.query;
    const filter = { status: 'published' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await CommunityPost.find(filter)
      .populate('authorId', 'name role profileImage')
      .sort({ createdAt: -1 });

    return sendSuccess(res, posts, 'Community posts retrieved');
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, body, category, tags } = req.body;

    if (!title || !body) {
      return sendError(res, 'Title and body are required', 400);
    }

    const post = await CommunityPost.create({
      authorId: req.user._id,
      title: title.trim(),
      body: body.trim(),
      category: category || 'general',
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      status: 'published'
    });

    const populated = await post.populate('authorId', 'name role profileImage');
    return sendSuccess(res, populated, 'Post created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('authorId', 'name role profileImage');

    if (!post || post.status === 'removed') {
      return sendError(res, 'Post not found or has been removed', 404);
    }

    const comments = await Comment.find({ postId: post._id, status: 'published' })
      .populate('authorId', 'name role profileImage')
      .sort({ createdAt: 1 });

    return sendSuccess(res, { post, comments }, 'Post and comments retrieved');
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found', 404);

    if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You can only edit your own posts.', 403);
    }

    const { title, body, category, tags } = req.body;
    if (title) post.title = title.trim();
    if (body) post.body = body.trim();
    if (category) post.category = category;
    if (tags) post.tags = tags;

    await post.save();
    return sendSuccess(res, post, 'Post updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found', 404);

    if (req.user.role !== 'admin' && post.authorId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    post.status = 'removed';
    await post.save();
    return sendSuccess(res, {}, 'Post removed');
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return sendError(res, 'Comment text is required', 400);
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.status !== 'published') {
      return sendError(res, 'Cannot comment on inactive or removed post', 400);
    }

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user._id,
      body: body.trim(),
      status: 'published'
    });

    post.commentCount += 1;
    await post.save();

    const populated = await comment.populate('authorId', 'name role profileImage');
    return sendSuccess(res, populated, 'Comment added successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return sendError(res, 'Reason for report is required', 400);
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found', 404);

    post.reports.push({
      reporterId: req.user._id,
      reason: reason.trim(),
      createdAt: new Date()
    });

    await post.save();
    return sendSuccess(res, {}, 'Thank you. The post has been flagged for moderation review.');
  } catch (err) {
    next(err);
  }
};
