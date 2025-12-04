const fs = require('fs').promises;
const { uploadImage, uploadMultipleImages, deleteImage } = require('../config/cloudinary');
const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private
 */
exports.uploadSingleImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Upload to Cloudinary
  const result = await uploadImage(req.file.path, 'onlyarts/general');

  // Delete local file after upload
  await fs.unlink(req.file.path);

  successResponse(res, {
    url: result.url,
    publicId: result.publicId,
    width: result.width,
    height: result.height,
  }, 'Image uploaded successfully', 201);
});

/**
 * @route   POST /api/upload/artwork/:artworkId/images
 * @desc    Upload artwork images
 * @access  Private (Artwork owner only)
 */
exports.uploadArtworkImages = asyncHandler(async (req, res, next) => {
  const { artworkId } = req.params;

  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  // Check if artwork exists and user is owner
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [artworkId]
  );

  if (artworkResult.rows.length === 0) {
    // Delete uploaded files
    for (const file of req.files) {
      await fs.unlink(file.path);
    }
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  if (artwork.artist_id !== req.user.id && !req.user.is_admin) {
    // Delete uploaded files
    for (const file of req.files) {
      await fs.unlink(file.path);
    }
    return next(new AppError('You can only upload images to your own artworks', 403));
  }

  // Upload all images to Cloudinary
  const filePaths = req.files.map(file => file.path);
  const uploadResults = await uploadMultipleImages(filePaths, `onlyarts/artworks/${artworkId}`);

  // Get current max display order
  const maxOrderResult = await query(
    'SELECT MAX(display_order) as max_order FROM artwork_media WHERE artwork_id = ?',
    [artworkId]
  );
  let displayOrder = maxOrderResult.rows[0].max_order || 0;

  // Check if artwork has any primary image
  const primaryResult = await query(
    'SELECT id FROM artwork_media WHERE artwork_id = ? AND is_primary = TRUE',
    [artworkId]
  );
  const hasPrimary = primaryResult.rows.length > 0;

  // Save media records to database
  const mediaRecords = [];
  for (let i = 0; i < uploadResults.length; i++) {
    const result = uploadResults[i];
    displayOrder++;

    const insertResult = await query(
      `INSERT INTO artwork_media
       (artwork_id, media_url, media_type, display_order, is_primary, cloudinary_public_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artworkId,
        result.url,
        'image',
        displayOrder,
        !hasPrimary && i === 0, // First image becomes primary if no primary exists
        result.publicId
      ]
    );

    mediaRecords.push({
      id: insertResult.rows.insertId,
      media_url: result.url,
      display_order: displayOrder,
      is_primary: !hasPrimary && i === 0,
    });
  }

  // Delete local files after upload
  for (const file of req.files) {
    await fs.unlink(file.path);
  }

  successResponse(res, {
    artwork_id: artworkId,
    media: mediaRecords,
  }, 'Images uploaded successfully', 201);
});

/**
 * @route   DELETE /api/upload/artwork/:artworkId/images/:mediaId
 * @desc    Delete artwork image
 * @access  Private (Artwork owner only)
 */
exports.deleteArtworkImage = asyncHandler(async (req, res, next) => {
  const { artworkId, mediaId } = req.params;

  // Check if artwork exists and user is owner
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [artworkId]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  if (artwork.artist_id !== req.user.id && !req.user.is_admin) {
    return next(new AppError('You can only delete images from your own artworks', 403));
  }

  // Get media record
  const mediaResult = await query(
    'SELECT * FROM artwork_media WHERE id = ? AND artwork_id = ?',
    [mediaId, artworkId]
  );

  if (mediaResult.rows.length === 0) {
    return next(new AppError('Image not found', 404));
  }

  const media = mediaResult.rows[0];

  // Delete from Cloudinary
  if (media.cloudinary_public_id) {
    try {
      await deleteImage(media.cloudinary_public_id);
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      // Continue even if Cloudinary deletion fails
    }
  }

  // Delete from database
  await query('DELETE FROM artwork_media WHERE id = ?', [mediaId]);

  // If deleted image was primary, set another image as primary
  if (media.is_primary) {
    const otherMediaResult = await query(
      'SELECT id FROM artwork_media WHERE artwork_id = ? ORDER BY display_order LIMIT 1',
      [artworkId]
    );

    if (otherMediaResult.rows.length > 0) {
      await query(
        'UPDATE artwork_media SET is_primary = TRUE WHERE id = ?',
        [otherMediaResult.rows[0].id]
      );
    }
  }

  successResponse(res, null, 'Image deleted successfully');
});

/**
 * @route   PUT /api/upload/artwork/:artworkId/images/:mediaId/primary
 * @desc    Set image as primary
 * @access  Private (Artwork owner only)
 */
exports.setPrimaryImage = asyncHandler(async (req, res, next) => {
  const { artworkId, mediaId } = req.params;

  // Check if artwork exists and user is owner
  const artworkResult = await query(
    'SELECT * FROM artworks WHERE id = ?',
    [artworkId]
  );

  if (artworkResult.rows.length === 0) {
    return next(new AppError('Artwork not found', 404));
  }

  const artwork = artworkResult.rows[0];

  if (artwork.artist_id !== req.user.id && !req.user.is_admin) {
    return next(new AppError('You can only modify your own artworks', 403));
  }

  // Check if media exists
  const mediaResult = await query(
    'SELECT id FROM artwork_media WHERE id = ? AND artwork_id = ?',
    [mediaId, artworkId]
  );

  if (mediaResult.rows.length === 0) {
    return next(new AppError('Image not found', 404));
  }

  // Remove primary flag from all images of this artwork
  await query(
    'UPDATE artwork_media SET is_primary = FALSE WHERE artwork_id = ?',
    [artworkId]
  );

  // Set this image as primary
  await query(
    'UPDATE artwork_media SET is_primary = TRUE WHERE id = ?',
    [mediaId]
  );

  successResponse(res, null, 'Primary image updated successfully');
});

/**
 * @route   GET /api/upload/artwork/:artworkId/images
 * @desc    Get all images for an artwork
 * @access  Public
 */
exports.getArtworkImages = asyncHandler(async (req, res, next) => {
  const { artworkId } = req.params;

  const result = await query(
    `SELECT id, media_url, media_type, display_order, is_primary, created_at
     FROM artwork_media
     WHERE artwork_id = ?
     ORDER BY display_order`,
    [artworkId]
  );

  successResponse(res, result.rows, 'Images retrieved successfully');
});

module.exports = exports;
