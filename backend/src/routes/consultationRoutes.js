const express = require('express');
const consultationController = require('../controllers/consultationController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// All consultation routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/consultations/artists
 * @desc    Get available artists for consultation
 * @access  Private (Premium only)
 */
router.get('/artists', consultationController.getAvailableArtists);

/**
 * @route   GET /api/consultations/artists/:id/availability
 * @desc    Get artist's availability slots
 * @access  Private
 */
router.get('/artists/:id/availability', consultationController.getArtistAvailability);

/**
 * @route   GET /api/consultations/my-bookings
 * @desc    Get user's booked consultations
 * @access  Private
 */
router.get('/my-bookings', consultationController.getMyBookings);

/**
 * @route   POST /api/consultations/request
 * @desc    Request a consultation with an artist (simplified flow)
 * @access  Private
 */
router.post('/request', consultationController.requestConsultation);

/**
 * @route   POST /api/consultations/book
 * @desc    Book a consultation session
 * @access  Private
 */
router.post('/book', consultationController.bookConsultation);

/**
 * @route   DELETE /api/consultations/:id
 * @desc    Cancel a consultation
 * @access  Private
 */
router.delete('/:id', consultationController.cancelConsultation);

/**
 * @route   POST /api/consultations/:id/rate
 * @desc    Rate a completed consultation
 * @access  Private
 */
router.post('/:id/rate', consultationController.rateConsultation);

/**
 * @route   POST /api/consultations/:id/join
 * @desc    Join a consultation video call
 * @access  Private
 */
router.post('/:id/join', consultationController.joinConsultation);

module.exports = router;
