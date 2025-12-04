const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/consultations/artists
 * @desc    Get available artists for consultation
 * @access  Private (Premium only)
 */
exports.getAvailableArtists = asyncHandler(async (req, res, next) => {
  // For now, return users who are artists
  const result = await query(
    `SELECT
      u.id, u.username, u.full_name as name, u.profile_image,
      u.bio as description,
      COUNT(DISTINCT a.id) as artwork_count
     FROM users u
     LEFT JOIN artworks a ON u.id = a.artist_id AND a.status = 'published'
     WHERE u.is_active = TRUE
     GROUP BY u.id
     HAVING artwork_count > 0
     ORDER BY artwork_count DESC
     LIMIT 20`
  );

  const artists = result.rows.map(artist => ({
    ...artist,
    specialty: 'Digital Art & NFTs',
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 100) + 20,
    hourlyRate: Math.floor(Math.random() * 100) + 100,
    availability: 'Available',
    topics: ['Digital Art', 'Portfolio Review', 'Career Guidance']
  }));

  successResponse(res, artists, 'Artists retrieved');
});

/**
 * @route   GET /api/consultations/my-bookings
 * @desc    Get user's booked consultations
 * @access  Private
 */
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  // Return empty array for now - full implementation later
  successResponse(res, [], 'Consultations retrieved');
});

/**
 * @route   GET /api/consultations/artists/:id/availability
 * @desc    Get artist's availability slots
 * @access  Private
 */
exports.getArtistAvailability = asyncHandler(async (req, res, next) => {
  // Return mock slots for now
  const slots = [
    { id: 'slot-1', date: new Date().toISOString().split('T')[0], time: '10:00 AM', available: true },
    { id: 'slot-2', date: new Date().toISOString().split('T')[0], time: '2:00 PM', available: true },
    { id: 'slot-3', date: new Date().toISOString().split('T')[0], time: '4:00 PM', available: true },
  ];

  successResponse(res, slots, 'Availability retrieved');
});

/**
 * @route   POST /api/consultations/request
 * @desc    Request a consultation with an artist (simplified flow)
 * @access  Private
 */
exports.requestConsultation = asyncHandler(async (req, res, next) => {
  const { artistId, dateTime, topic, notes } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!artistId || !dateTime || !topic) {
    return res.status(400).json({
      success: false,
      message: 'Artist ID, date/time, and topic are required'
    });
  }

  // Check if artist exists
  const artistCheck = await query(
    'SELECT id, username, full_name FROM users WHERE id = ? AND is_active = TRUE',
    [artistId]
  );

  if (artistCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Artist not found'
    });
  }

  // For now, create a mock consultation request
  // In a full implementation, this would create a database record
  const consultation = {
    id: Date.now(),
    userId,
    artistId,
    artistName: artistCheck.rows[0].full_name || artistCheck.rows[0].username,
    dateTime,
    topic,
    notes: notes || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // TODO: Send notification to the artist about the consultation request
  // TODO: Store the consultation request in a consultations table

  successResponse(res, consultation, 'Consultation request sent successfully', 201);
});

/**
 * @route   POST /api/consultations/book
 * @desc    Book a consultation session
 * @access  Private
 */
exports.bookConsultation = asyncHandler(async (req, res, next) => {
  // Mock booking for now
  successResponse(res, { id: Date.now(), status: 'confirmed' }, 'Consultation booked', 201);
});

/**
 * @route   DELETE /api/consultations/:id
 * @desc    Cancel a consultation
 * @access  Private
 */
exports.cancelConsultation = asyncHandler(async (req, res, next) => {
  successResponse(res, null, 'Consultation cancelled');
});

/**
 * @route   POST /api/consultations/:id/rate
 * @desc    Rate a completed consultation
 * @access  Private
 */
exports.rateConsultation = asyncHandler(async (req, res, next) => {
  successResponse(res, null, 'Rating submitted');
});

/**
 * @route   POST /api/consultations/:id/join
 * @desc    Join a consultation video call
 * @access  Private
 */
exports.joinConsultation = asyncHandler(async (req, res, next) => {
  const meetingLink = `https://meet.onlyarts.com/${req.params.id}`;
  successResponse(res, { meetingLink }, 'Meeting link generated');
});

module.exports = exports;
