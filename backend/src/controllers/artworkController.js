const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { notifyNewArtwork } = require('../utils/notifications');

/**
 * @route   GET /api/artworks
 * @desc    Get all artworks with filters
 * @access  Public
 */
exports.getAllArtworks = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category || '';
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const sortBy = req.query.sortBy || 'created_at';
  const order = req.query.order || 'DESC';
  const search = req.query.search || '';
  const following = req.query.following === 'true';

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions = ['a.status = ?'];
  const values = ['published'];

  // Filter by following users only
  if (following && req.user) {
    conditions.push('a.artist_id IN (SELECT following_id FROM follows WHERE follower_id = ?)');
    values.push(req.user.id);
  }

  if (category) {
    conditions.push('a.category = ?');
    values.push(category);
  }

  if (minPrice > 0) {
    conditions.push('a.price >= ?');
    values.push(minPrice);
  }

  if (maxPrice < Number.MAX_SAFE_INTEGER) {
    conditions.push('a.price <= ?');
    values.push(maxPrice);
  }

  if (search) {
    conditions.push('(a.title LIKE ? OR a.description LIKE ? OR u.username LIKE ?)');
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.join(' AND ');

  // Validate sortBy
  const allowedSortFields = ['created_at', 'price', 'like_count', 'view_count', 'title'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get artworks with artist info and primary image
  const artworksResult = await query(
    `SELECT a.id, a.title, a.description, a.price, a.category, a.medium,
            a.dimensions, a.year_created, a.like_count, a.comment_count, a.view_count,
            a.is_for_sale, a.stock_quantity, a.created_at,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            u.profile_image as artist_image,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
            ${req.user?.id ? `(SELECT COUNT(*) FROM likes WHERE user_id = ${req.user.id} AND artwork_id = a.id) as is_liked` : '0 as is_liked'}
     FROM artworks a
     JOIN users u ON a.artist_id = u.id
     WHERE ${whereClause}
     ORDER BY a.${sortField} ${sortOrder}
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM artworks a
     JOIN users u ON a.artist_id = u.id
     WHERE ${whereClause}`,
    values
  );

  // Get exhibitions for each artwork
  const artworksWithExhibitions = await Promise.all(
    artworksResult.rows.map(async (artwork) => {
      const exhibitionsResult = await query(
        `SELECT e.id, e.title, e.start_date, e.end_date, ea.artwork_type
         FROM exhibition_artworks ea
         JOIN exhibitions e ON ea.exhibition_id = e.id
         WHERE ea.artwork_id = ? AND e.status = 'published'
         ORDER BY e.start_date DESC
         LIMIT 3`,
        [artwork.id]
      );

      return {
        ...artwork,
        exhibitions: exhibitionsResult.rows || []
      };
    })
  );

  successResponse(res, {
    artworks: artworksWithExhibitions,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Artworks retrieved');
});

/**
 * @route   GET /api/artworks/:id
 * @desc    Get single artwork by ID
 * @access  Public
 */
exports.getArtworkById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Get artwork details
  const artworkResult = await query(
    `SELECT a.*,
            u.id as artist_id, u.username as artist_username, u.full_name as artist_name,
            u.profile_image as artist_image, u.bio as artist_bio,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image,
            ${req.user?.id ? `(SELECT COUNT(*) FROM follows WHERE follower_id = ${req.user.id} AND following_id = a.artist_id) as is_following,` : '0 as is_following,'}
            ${req.user?.id ? `(SELECT COUNT(*) FROM likes WHERE user_id = ${req.user.id} AND artwork_id = a.id) as is_liked` : '0 as is_liked'}
     FROM artworks a
     JOIN users u ON a.artist_id = u.id
     WHERE a.id = ? AND (a.status = 'published' OR a.artist_id = ?)`,
    [id, req.user?.id || 0]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  // Get all media for this artwork
  const mediaResult = await query(
    'SELECT * FROM artwork_media WHERE artwork_id = ? ORDER BY display_order',
    [id]
  );

  artwork.media = mediaResult.rows;

  // Check if current user liked this artwork
  if (req.user) {
    const likeResult = await query(
      'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
      [req.user.id, id]
    );
    artwork.is_liked = likeResult.rows.length > 0;
  }

  // Get exhibitions this artwork is part of
  const exhibitionsResult = await query(
    `SELECT e.id, e.title, e.start_date, e.end_date, ea.artwork_type
     FROM exhibition_artworks ea
     JOIN exhibitions e ON ea.exhibition_id = e.id
     WHERE ea.artwork_id = ? AND e.status = 'published'
     ORDER BY e.start_date DESC`,
    [id]
  );
  artwork.exhibitions = exhibitionsResult.rows;

  // Increment view count (async, don't wait)
  query('UPDATE artworks SET view_count = view_count + 1 WHERE id = ?', [id]);

  successResponse(res, artwork, 'Artwork retrieved');
});

/**
 * @route   POST /api/artworks
 * @desc    Create new artwork
 * @access  Private (Artists only)
 */
exports.createArtwork = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    price,
    category,
    medium,
    dimensions,
    yearCreated,
    isOriginal,
    isForSale,
    forSale,
    stockQuantity,
    tags
  } = req.body;

  // Validate required fields
  if (!title || !title.trim()) {
    if (req.file) {
      await require('fs').promises.unlink(req.file.path);
    }
    return next(new AppError('Title is required', 400));
  }

  // Determine if artwork is for sale (handle both isForSale and forSale)
  const artworkForSale = isForSale === 'true' || isForSale === true || forSale === 'true' || forSale === true;

  // Set default category if not provided
  const artworkCategory = category || 'digital';

  // Set default price if not provided
  let artworkPrice = price || 0;
  if (typeof artworkPrice === 'string') {
    artworkPrice = parseFloat(artworkPrice);
  }

  // Create artwork
  const result = await query(
    `INSERT INTO artworks
     (artist_id, title, description, price, category, medium, dimensions,
      year_created, is_original, is_for_sale, stock_quantity, tags, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
    [
      req.user.id,
      title.trim(),
      description || null,
      artworkPrice,
      artworkCategory,
      medium || null,
      dimensions || null,
      yearCreated || null,
      isOriginal !== undefined ? isOriginal : true,
      artworkForSale,
      stockQuantity || 1,
      tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null
    ]
  );

  const artworkId = result.rows.insertId;

  // Handle image upload if file was provided
  if (req.file) {
    try {
      const fs = require('fs').promises;
      let imageUrl = null;
      let cloudinaryPublicId = null;

      // Try Cloudinary upload if credentials are configured
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        try {
          const { uploadImage } = require('../config/cloudinary');
          const uploadResult = await uploadImage(req.file.path, `onlyarts/artworks/${artworkId}`);
          imageUrl = uploadResult.url;
          cloudinaryPublicId = uploadResult.publicId;

          // Delete local file after successful Cloudinary upload
          await fs.unlink(req.file.path);
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed, using local storage:', cloudinaryError.message);
          // Fall back to local storage
          imageUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        // Use local file storage if Cloudinary is not configured
        imageUrl = `/uploads/${req.file.filename}`;
      }

      // Save media record to database
      await query(
        `INSERT INTO artwork_media
         (artwork_id, media_url, media_type, display_order, is_primary, cloudinary_public_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          artworkId,
          imageUrl,
          'image',
          1,
          true,
          cloudinaryPublicId
        ]
      );
    } catch (error) {
      console.error('Error uploading artwork image:', error);
      // Don't fail the whole request if image upload fails
      // The artwork is still created, user can upload image later
    }
  }

  // Update user's artwork count
  await query(
    'UPDATE users SET artwork_count = artwork_count + 1 WHERE id = ?',
    [req.user.id]
  );

  // Get created artwork with media
  const artworkResult = await query(
    `SELECT a.*,
            (SELECT media_url FROM artwork_media WHERE artwork_id = a.id AND is_primary = TRUE LIMIT 1) as primary_image
     FROM artworks a WHERE a.id = ?`,
    [artworkId]
  );

  // Send notifications to followers if artwork is for sale
  if (artworkForSale && artworkPrice > 0) {
    try {
      const userInfo = await query(
        'SELECT username FROM users WHERE id = ?',
        [req.user.id]
      );
      if (userInfo.rows.length > 0) {
        await notifyNewArtwork(
          req.user.id,
          userInfo.rows[0].username,
          artworkId,
          title.trim(),
          artworkPrice
        );
      }
    } catch (error) {
      console.error('Failed to send new artwork notifications:', error);
      // Don't fail the request if notification fails
    }
  }

  successResponse(res, artworkResult.rows[0], 'Artwork created successfully', 201);
});

/**
 * @route   PUT /api/artworks/:id
 * @desc    Update artwork
 * @access  Private (Owner only)
 */
exports.updateArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if artwork exists and user is owner
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [id]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  if (artwork.artist_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own artworks', 403));
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400));
  }

  const {
    title,
    description,
    price,
    category,
    medium,
    dimensions,
    yearCreated,
    isOriginal,
    isForSale,
    stockQuantity,
    status,
    tags
  } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    values.push(category);
  }
  if (medium !== undefined) {
    updates.push('medium = ?');
    values.push(medium);
  }
  if (dimensions !== undefined) {
    updates.push('dimensions = ?');
    values.push(dimensions);
  }
  if (yearCreated !== undefined) {
    updates.push('year_created = ?');
    values.push(yearCreated);
  }
  if (isOriginal !== undefined) {
    updates.push('is_original = ?');
    values.push(isOriginal);
  }
  if (isForSale !== undefined) {
    updates.push('is_for_sale = ?');
    values.push(isForSale);
  }
  if (stockQuantity !== undefined) {
    updates.push('stock_quantity = ?');
    values.push(stockQuantity);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(tags));
  }

  if (updates.length === 0) {
    return next(new AppError('No fields to update', 400));
  }

  values.push(id);

  await query(
    `UPDATE artworks SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Get updated artwork
  const updatedResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [id]
  );

  successResponse(res, updatedResult.rows[0], 'Artwork updated successfully');
});

/**
 * @route   DELETE /api/artworks/:id
 * @desc    Delete artwork
 * @access  Private (Owner only)
 */
exports.deleteArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if artwork exists and user is owner
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [id]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  if (artwork.artist_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own artworks', 403));
  }

  // Delete artwork (cascade will delete media, likes, comments)
  await query('DELETE FROM artworks WHERE id = ?', [id]);

  // Update user's artwork count
  await query(
    'UPDATE users SET artwork_count = artwork_count - 1 WHERE id = ?',
    [artwork.artist_id]
  );

  successResponse(res, null, 'Artwork deleted successfully');
});

/**
 * @route   POST /api/artworks/:id/like
 * @desc    Like an artwork
 * @access  Private
 */
exports.likeArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if artwork exists
  const artworkResult = await query(
    'SELECT id FROM artworks WHERE id = ? AND status = ?',
    [id, 'published']
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  // Check if already liked
  const existingLike = await query(
    'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  // Toggle: If already liked, unlike it
  if (existingLike.rows.length > 0) {
    await query(
      'DELETE FROM likes WHERE user_id = ? AND artwork_id = ?',
      [req.user.id, id]
    );

    await query(
      'UPDATE artworks SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
      [id]
    );

    return successResponse(res, { liked: false }, 'Artwork unliked successfully');
  }

  // Create like
  await query(
    'INSERT INTO likes (user_id, artwork_id) VALUES (?, ?)',
    [req.user.id, id]
  );

  // Update like count
  await query(
    'UPDATE artworks SET like_count = like_count + 1 WHERE id = ?',
    [id]
  );

  successResponse(res, { liked: true }, 'Artwork liked successfully');
});

/**
 * @route   DELETE /api/artworks/:id/like
 * @desc    Unlike an artwork
 * @access  Private
 */
exports.unlikeArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if like exists
  const likeResult = await query(
    'SELECT id FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  if (likeResult.rows.length === 0) {
    return next(new AppError('You have not liked this artwork', 400));
  }

  // Delete like
  await query(
    'DELETE FROM likes WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  // Update like count
  await query(
    'UPDATE artworks SET like_count = like_count - 1 WHERE id = ?',
    [id]
  );

  successResponse(res, null, 'Artwork unliked successfully');
});

/**
 * @route   POST /api/artworks/:id/share
 * @desc    Share artwork to user's profile
 * @access  Private
 */
exports.shareArtwork = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if artwork exists and is published
  const artworkResult = await query(
    'SELECT id, title FROM artworks WHERE id = ? AND status = ?',
    [id, 'published']
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  // Check if already shared
  const existingShare = await query(
    'SELECT id FROM shares WHERE user_id = ? AND artwork_id = ?',
    [req.user.id, id]
  );

  if (existingShare.rows.length > 0) {
    // Already shared - return success instead of error for better UX
    return successResponse(res, { artwork_id: id, already_shared: true }, 'This artwork is already in your shared posts');
  }

  // Create share
  await query(
    'INSERT INTO shares (user_id, artwork_id) VALUES (?, ?)',
    [req.user.id, id]
  );

  successResponse(res, { artwork_id: id, already_shared: false }, 'Artwork shared to your profile successfully');
});

/**
 * @route   GET /api/artworks/:id/comments
 * @desc    Get comments for an artwork
 * @access  Public
 */
exports.getArtworkComments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  // Get comments with user info
  const commentsResult = await query(
    `SELECT c.id, c.content, c.is_edited, c.created_at, c.parent_id,
            u.id as user_id, u.username, u.full_name, u.profile_image
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.artwork_id = ?
     ORDER BY c.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [id]
  );

  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM comments WHERE artwork_id = ?',
    [id]
  );

  successResponse(res, {
    comments: commentsResult.rows,
    pagination: {
      total: countResult.rows[0].total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  }, 'Comments retrieved');
});

/**
 * @route   POST /api/artworks/:id/comments
 * @desc    Add comment to artwork
 * @access  Private
 */
exports.addComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content, parentId } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new AppError('Comment content is required', 400));
  }

  // Check if artwork exists
  const artworkResult = await query(
    'SELECT id FROM artworks WHERE id = ? AND status = ?',
    [id, 'published']
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  // If parentId provided, check if parent comment exists
  if (parentId) {
    const parentResult = await query(
      'SELECT id FROM comments WHERE id = ? AND artwork_id = ?',
      [parentId, id]
    );

    if (parentResult.rows.length === 0) {
      return next(new AppError('Parent comment not found', 404));
    }
  }

  // Create comment
  const result = await query(
    'INSERT INTO comments (artwork_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
    [id, req.user.id, parentId || null, content.trim()]
  );

  const commentId = result.rows.insertId;

  // Update comment count
  await query(
    'UPDATE artworks SET comment_count = comment_count + 1 WHERE id = ?',
    [id]
  );

  // Get created comment with user info
  const commentResult = await query(
    `SELECT c.id, c.content, c.is_edited, c.created_at, c.parent_id,
            u.id as user_id, u.username, u.full_name, u.profile_image
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = ?`,
    [commentId]
  );

  successResponse(res, commentResult.rows[0], 'Comment added successfully', 201);
});

/**
 * @route   DELETE /api/artworks/:artworkId/comments/:commentId
 * @desc    Delete comment
 * @access  Private (Owner only)
 */
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { artworkId, commentId } = req.params;

  // Check if comment exists and user is owner
  const commentResult = await query(
    'SELECT * FROM comments WHERE id = ? AND artwork_id = ?',
    [commentId, artworkId]
  );

  if (commentResult.rows.length === 0) {
    return next(new AppError('Comment not found', 404));
  }

  const comment = commentResult.rows[0];

  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own comments', 403));
  }

  // Delete comment (cascade will delete replies)
  await query('DELETE FROM comments WHERE id = ?', [commentId]);

  // Update comment count
  await query(
    'UPDATE artworks SET comment_count = comment_count - 1 WHERE id = ?',
    [artworkId]
  );

  successResponse(res, null, 'Comment deleted successfully');
});

module.exports = exports;
