const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image (general purpose)
 * @access  Private
 */
router.post(
  '/image',
  authenticate,
  uploadSingle,
  uploadController.uploadSingleImage
);

/**
 * @route   POST /api/upload/artwork/:artworkId/images
 * @desc    Upload multiple images for an artwork
 * @access  Private (Artwork owner only)
 */
router.post(
  '/artwork/:artworkId/images',
  authenticate,
  requireRole('artist', 'admin'),
  uploadMultiple,
  uploadController.uploadArtworkImages
);

/**
 * @route   GET /api/upload/artwork/:artworkId/images
 * @desc    Get all images for an artwork
 * @access  Public
 */
router.get(
  '/artwork/:artworkId/images',
  uploadController.getArtworkImages
);

/**
 * @route   DELETE /api/upload/artwork/:artworkId/images/:mediaId
 * @desc    Delete artwork image
 * @access  Private (Artwork owner only)
 */
router.delete(
  '/artwork/:artworkId/images/:mediaId',
  authenticate,
  uploadController.deleteArtworkImage
);

/**
 * @route   PUT /api/upload/artwork/:artworkId/images/:mediaId/primary
 * @desc    Set image as primary
 * @access  Private (Artwork owner only)
 */
router.put(
  '/artwork/:artworkId/images/:mediaId/primary',
  authenticate,
  uploadController.setPrimaryImage
);

module.exports = router;
