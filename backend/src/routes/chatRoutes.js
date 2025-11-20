const express = require('express');
const { body, query } = require('express-validator');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations', chatController.getConversations);

/**
 * @route   POST /api/chat/conversations
 * @desc    Create or get conversation
 * @access  Private
 */
router.post(
  '/conversations',
  [
    body('recipientId')
      .notEmpty()
      .withMessage('Recipient ID is required')
      .isInt()
      .withMessage('Recipient ID must be an integer'),
  ],
  chatController.createConversation
);

/**
 * @route   GET /api/chat/conversations/:id/messages
 * @desc    Get conversation messages
 * @access  Private
 */
router.get(
  '/conversations/:id/messages',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  ],
  chatController.getMessages
);

/**
 * @route   POST /api/chat/conversations/:id/messages
 * @desc    Send message
 * @access  Private
 */
router.post(
  '/conversations/:id/messages',
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 2000 })
      .withMessage('Message too long'),
  ],
  chatController.sendMessage
);

/**
 * @route   POST /api/chat/conversations/:id/read
 * @desc    Mark all messages in conversation as read
 * @access  Private
 */
router.post('/conversations/:id/read', chatController.markConversationAsRead);

/**
 * @route   PUT /api/chat/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/messages/:id/read', chatController.markAsRead);

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', chatController.getUnreadCount);

/**
 * @route   DELETE /api/chat/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete('/conversations/:id', chatController.deleteConversation);

module.exports = router;
