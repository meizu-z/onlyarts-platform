# Day 5: Artwork Management Endpoints

**Goal:** Complete artwork CRUD operations with filters, search, and favorites

**Time Estimate:** 5-6 hours

---

## Overview

Today you'll implement all artwork-related endpoints matching your frontend's [artwork.service.js](src/services/artwork.service.js).

**Features to Implement:**
- List artworks with pagination and filters
- Get single artwork by ID
- Create new artwork
- Update artwork
- Delete artwork
- Favorite/unfavorite system
- Increment view counter
- Search artworks

---

## Step 1: Create Artwork Model (60 min)

Create `backend/src/models/artwork.model.js`:

```javascript
const { query, pool } = require('../config/database');

/**
 * Create new artwork
 */
const createArtwork = async (artworkData) => {
  const {
    userId,
    title,
    description,
    imageUrl,
    price,
    category,
    tags = [],
    dimensions,
    fileSize,
    status = 'published',
  } = artworkData;

  const result = await query(
    `INSERT INTO artworks (
      user_id, title, description, image_url, price, category,
      tags, dimensions, file_size, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [userId, title, description, imageUrl, price, category, tags, dimensions, fileSize, status]
  );

  // Increment user's artworks_count
  await query(
    `UPDATE users SET artworks_count = artworks_count + 1 WHERE id = $1`,
    [userId]
  );

  return result.rows[0];
};

/**
 * Get artwork by ID with artist info
 */
const findById = async (artworkId) => {
  const result = await query(
    `SELECT
      a.*,
      u.username as artist_username,
      u.full_name as artist_name,
      u.profile_picture as artist_profile_picture,
      u.is_verified as artist_is_verified,
      u.followers_count as artist_followers_count
    FROM artworks a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = $1`,
    [artworkId]
  );

  return result.rows[0];
};

/**
 * List artworks with filters and pagination
 */
const listArtworks = async (filters = {}) => {
  const {
    category,
    tags,
    minPrice,
    maxPrice,
    userId,
    status = 'published',
    search,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 20,
    offset = 0,
  } = filters;

  let whereConditions = ['a.status = $1'];
  let params = [status];
  let paramCount = 1;

  // Category filter
  if (category) {
    paramCount++;
    whereConditions.push(`a.category = $${paramCount}`);
    params.push(category);
  }

  // User filter (for user's artworks)
  if (userId) {
    paramCount++;
    whereConditions.push(`a.user_id = $${paramCount}`);
    params.push(userId);
  }

  // Price range filter
  if (minPrice !== undefined) {
    paramCount++;
    whereConditions.push(`a.price >= $${paramCount}`);
    params.push(minPrice);
  }

  if (maxPrice !== undefined) {
    paramCount++;
    whereConditions.push(`a.price <= $${paramCount}`);
    params.push(maxPrice);
  }

  // Tags filter (contains any of the tags)
  if (tags && tags.length > 0) {
    paramCount++;
    whereConditions.push(`a.tags && $${paramCount}`);
    params.push(tags);
  }

  // Search filter (title or description)
  if (search) {
    paramCount++;
    whereConditions.push(`(a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount})`);
    params.push(`%${search}%`);
  }

  // Validate sort column
  const allowedSortColumns = ['created_at', 'price', 'views_count', 'favorites_count', 'title'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  paramCount++;
  params.push(limit);
  const limitParam = paramCount;

  paramCount++;
  params.push(offset);
  const offsetParam = paramCount;

  const queryText = `
    SELECT
      a.*,
      u.username as artist_username,
      u.full_name as artist_name,
      u.profile_picture as artist_profile_picture,
      u.is_verified as artist_is_verified
    FROM artworks a
    JOIN users u ON a.user_id = u.id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY a.${sortColumn} ${order}
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const result = await query(queryText, params);

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM artworks a
    WHERE ${whereConditions.join(' AND ')}
  `;
  const countResult = await query(countQuery, params.slice(0, paramCount - 2));

  return {
    artworks: result.rows,
    total: parseInt(countResult.rows[0].total),
    limit,
    offset,
  };
};

/**
 * Update artwork
 */
const updateArtwork = async (artworkId, updates) => {
  const allowedFields = [
    'title',
    'description',
    'price',
    'category',
    'tags',
    'dimensions',
    'status',
    'is_featured',
    'is_for_sale',
  ];

  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(artworkId);

  const result = await query(
    `UPDATE artworks
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

/**
 * Delete artwork
 */
const deleteArtwork = async (artworkId, userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get artwork to verify ownership
    const artworkResult = await client.query(
      'SELECT user_id FROM artworks WHERE id = $1',
      [artworkId]
    );

    if (artworkResult.rows.length === 0) {
      throw new Error('Artwork not found');
    }

    const artwork = artworkResult.rows[0];

    if (artwork.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete artwork
    await client.query('DELETE FROM artworks WHERE id = $1', [artworkId]);

    // Decrement user's artworks_count
    await client.query(
      'UPDATE users SET artworks_count = GREATEST(artworks_count - 1, 0) WHERE id = $1',
      [userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Increment view counter
 */
const incrementViews = async (artworkId) => {
  await query(
    'UPDATE artworks SET views_count = views_count + 1 WHERE id = $1',
    [artworkId]
  );
};

/**
 * Add to favorites
 */
const addToFavorites = async (userId, artworkId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert favorite
    await client.query(
      `INSERT INTO favorites (user_id, artwork_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, artwork_id) DO NOTHING`,
      [userId, artworkId]
    );

    // Increment favorites_count
    await client.query(
      'UPDATE artworks SET favorites_count = favorites_count + 1 WHERE id = $1',
      [artworkId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Remove from favorites
 */
const removeFromFavorites = async (userId, artworkId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete favorite
    const deleteResult = await client.query(
      'DELETE FROM favorites WHERE user_id = $1 AND artwork_id = $2',
      [userId, artworkId]
    );

    // Only decrement if actually deleted
    if (deleteResult.rowCount > 0) {
      await client.query(
        'UPDATE artworks SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = $1',
        [artworkId]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check if user has favorited artwork
 */
const isFavorited = async (userId, artworkId) => {
  const result = await query(
    `SELECT EXISTS(
      SELECT 1 FROM favorites
      WHERE user_id = $1 AND artwork_id = $2
    )`,
    [userId, artworkId]
  );
  return result.rows[0].exists;
};

/**
 * Get user's favorited artworks
 */
const getFavorites = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT
      a.*,
      u.username as artist_username,
      u.full_name as artist_name,
      u.profile_picture as artist_profile_picture,
      f.created_at as favorited_at
    FROM artworks a
    JOIN users u ON a.user_id = u.id
    JOIN favorites f ON a.id = f.artwork_id
    WHERE f.user_id = $1 AND a.status = 'published'
    ORDER BY f.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get featured artworks
 */
const getFeaturedArtworks = async (limit = 10) => {
  const result = await query(
    `SELECT
      a.*,
      u.username as artist_username,
      u.full_name as artist_name,
      u.profile_picture as artist_profile_picture
    FROM artworks a
    JOIN users u ON a.user_id = u.id
    WHERE a.is_featured = true AND a.status = 'published'
    ORDER BY a.created_at DESC
    LIMIT $1`,
    [limit]
  );

  return result.rows;
};

module.exports = {
  createArtwork,
  findById,
  listArtworks,
  updateArtwork,
  deleteArtwork,
  incrementViews,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
  getFavorites,
  getFeaturedArtworks,
};
```

---

## Step 2: Create Artwork Controller (50 min)

Create `backend/src/controllers/artwork.controller.js`:

```javascript
const { body, param, query: queryValidator, validationResult } = require('express-validator');
const ArtworkModel = require('../models/artwork.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * List artworks with filters
 * GET /api/artworks
 */
const listArtworks = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    tags: req.query.tags ? req.query.tags.split(',') : undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    userId: req.query.userId,
    status: req.query.status || 'published',
    search: req.query.search,
    sortBy: req.query.sortBy || 'created_at',
    sortOrder: req.query.sortOrder || 'DESC',
    limit: parseInt(req.query.limit) || 20,
    offset: parseInt(req.query.offset) || 0,
  };

  const result = await ArtworkModel.listArtworks(filters);

  successResponse(res, result);
});

/**
 * Get artwork by ID
 * GET /api/artworks/:id
 */
const getArtworkById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artwork = await ArtworkModel.findById(id);

  if (!artwork) {
    return errorResponse(res, 'Artwork not found', 404);
  }

  // Increment view count (don't await, fire and forget)
  ArtworkModel.incrementViews(id).catch(err => console.error('Failed to increment views:', err));

  // Check if favorited by current user
  let isFavorited = false;
  if (req.user?.userId) {
    isFavorited = await ArtworkModel.isFavorited(req.user.userId, id);
  }

  successResponse(res, {
    artwork: {
      ...artwork,
      isFavorited,
    },
  });
});

/**
 * Create new artwork
 * POST /api/artworks
 */
const createArtwork = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const artworkData = {
    userId: req.user.userId,
    ...req.body,
  };

  const artwork = await ArtworkModel.createArtwork(artworkData);

  successResponse(res, { artwork }, 'Artwork created successfully', 201);
});

/**
 * Update artwork
 * PUT /api/artworks/:id
 */
const updateArtwork = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const { id } = req.params;
  const userId = req.user.userId;

  // Check if artwork exists and user owns it
  const existing = await ArtworkModel.findById(id);

  if (!existing) {
    return errorResponse(res, 'Artwork not found', 404);
  }

  if (existing.user_id !== userId) {
    return errorResponse(res, 'You do not have permission to update this artwork', 403);
  }

  const updated = await ArtworkModel.updateArtwork(id, req.body);

  successResponse(res, { artwork: updated }, 'Artwork updated successfully');
});

/**
 * Delete artwork
 * DELETE /api/artworks/:id
 */
const deleteArtwork = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await ArtworkModel.deleteArtwork(id, userId);
    successResponse(res, null, 'Artwork deleted successfully');
  } catch (error) {
    if (error.message === 'Artwork not found') {
      return errorResponse(res, 'Artwork not found', 404);
    }
    if (error.message === 'Unauthorized') {
      return errorResponse(res, 'You do not have permission to delete this artwork', 403);
    }
    throw error;
  }
});

/**
 * Add artwork to favorites
 * POST /api/artworks/:id/favorite
 */
const addToFavorites = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  // Check if artwork exists
  const artwork = await ArtworkModel.findById(id);
  if (!artwork) {
    return errorResponse(res, 'Artwork not found', 404);
  }

  // Check if already favorited
  const alreadyFavorited = await ArtworkModel.isFavorited(userId, id);
  if (alreadyFavorited) {
    return errorResponse(res, 'Artwork already in favorites', 400);
  }

  await ArtworkModel.addToFavorites(userId, id);

  successResponse(res, null, 'Added to favorites');
});

/**
 * Remove artwork from favorites
 * DELETE /api/artworks/:id/favorite
 */
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  await ArtworkModel.removeFromFavorites(userId, id);

  successResponse(res, null, 'Removed from favorites');
});

/**
 * Get user's favorited artworks
 * GET /api/artworks/favorites/me
 */
const getMyFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const favorites = await ArtworkModel.getFavorites(userId, limit, offset);

  successResponse(res, {
    favorites,
    pagination: { limit, offset, count: favorites.length },
  });
});

/**
 * Get featured artworks
 * GET /api/artworks/featured
 */
const getFeaturedArtworks = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const artworks = await ArtworkModel.getFeaturedArtworks(limit);

  successResponse(res, { artworks });
});

// Validation rules
const createArtworkValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be 1-255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be max 2000 characters'),
  body('imageUrl')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['digital', 'painting', 'photography', 'sculpture', 'illustration', 'animation', '3d', 'traditional', 'mixed_media', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
];

const updateArtworkValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be 1-255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be max 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['digital', 'painting', 'photography', 'sculpture', 'illustration', 'animation', '3d', 'traditional', 'mixed_media', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

module.exports = {
  listArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  addToFavorites,
  removeFromFavorites,
  getMyFavorites,
  getFeaturedArtworks,
  createArtworkValidation,
  updateArtworkValidation,
};
```

---

## Step 3: Create Artwork Routes (25 min)

Create `backend/src/routes/artwork.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artwork.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/artworks/featured
 * @desc    Get featured artworks
 * @access  Public
 */
router.get('/featured', artworkController.getFeaturedArtworks);

/**
 * @route   GET /api/artworks/favorites/me
 * @desc    Get current user's favorites
 * @access  Private
 */
router.get('/favorites/me', authenticate, artworkController.getMyFavorites);

/**
 * @route   GET /api/artworks
 * @desc    List artworks with filters
 * @access  Public
 */
router.get('/', artworkController.listArtworks);

/**
 * @route   POST /api/artworks
 * @desc    Create new artwork
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  artworkController.createArtworkValidation,
  artworkController.createArtwork
);

/**
 * @route   GET /api/artworks/:id
 * @desc    Get artwork by ID
 * @access  Public (optionalAuth for favorite check)
 */
router.get('/:id', optionalAuth, artworkController.getArtworkById);

/**
 * @route   PUT /api/artworks/:id
 * @desc    Update artwork
 * @access  Private (owner only)
 */
router.put(
  '/:id',
  authenticate,
  artworkController.updateArtworkValidation,
  artworkController.updateArtwork
);

/**
 * @route   DELETE /api/artworks/:id
 * @desc    Delete artwork
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, artworkController.deleteArtwork);

/**
 * @route   POST /api/artworks/:id/favorite
 * @desc    Add to favorites
 * @access  Private
 */
router.post('/:id/favorite', authenticate, artworkController.addToFavorites);

/**
 * @route   DELETE /api/artworks/:id/favorite
 * @desc    Remove from favorites
 * @access  Private
 */
router.delete('/:id/favorite', authenticate, artworkController.removeFromFavorites);

module.exports = router;
```

---

## Step 4: Connect Routes and Update Frontend (15 min)

Update `backend/server.js`:

```javascript
// API ROUTES
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/artworks', require('./src/routes/artwork.routes')); // Add this
```

Update [src/services/artwork.service.js](src/services/artwork.service.js):

```javascript
const USE_DEMO_MODE = false; // Changed from true
```

---

## Step 5: Seed Artwork Test Data (20 min)

Create `backend/seeds/artworks.sql`:

```sql
-- Insert test artworks
DO $$
DECLARE
  user1 UUID;
  user2 UUID;
  user3 UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user1 FROM users WHERE username = 'meizzuuuuuuu' LIMIT 1;
  SELECT id INTO user2 FROM users WHERE username = 'artist_mike' LIMIT 1;
  SELECT id INTO user3 FROM users WHERE username = 'painter_lisa' LIMIT 1;

  -- Insert artworks for user1
  IF user1 IS NOT NULL THEN
    INSERT INTO artworks (user_id, title, description, image_url, price, category, tags, status, is_for_sale)
    VALUES
      (user1, 'Digital Sunset', 'Beautiful digital painting of a sunset', 'https://picsum.photos/seed/art1/800/600', 5000.00, 'digital', ARRAY['landscape', 'sunset', 'digital'], 'published', true),
      (user1, 'Anime Character Portrait', 'Original anime character design', 'https://picsum.photos/seed/art2/800/600', 3500.00, 'illustration', ARRAY['anime', 'character', 'portrait'], 'published', true),
      (user1, 'Abstract Dreams', 'Colorful abstract composition', 'https://picsum.photos/seed/art3/800/600', 4200.00, 'digital', ARRAY['abstract', 'colorful', 'modern'], 'published', true);
  END IF;

  -- Insert artworks for user2
  IF user2 IS NOT NULL THEN
    INSERT INTO artworks (user_id, title, description, image_url, price, category, tags, status, is_featured, is_for_sale)
    VALUES
      (user2, 'Portrait Study', 'Realistic portrait in oils', 'https://picsum.photos/seed/art4/800/600', 8000.00, 'painting', ARRAY['portrait', 'realistic', 'oil'], 'published', true, true),
      (user2, 'Urban Landscape', 'City scene at night', 'https://picsum.photos/seed/art5/800/600', 6500.00, 'painting', ARRAY['landscape', 'urban', 'night'], 'published', false, true);
  END IF;

  -- Insert artworks for user3
  IF user3 IS NOT NULL THEN
    INSERT INTO artworks (user_id, title, description, image_url, price, category, tags, status, is_for_sale)
    VALUES
      (user3, 'Abstract Waves', 'Modern abstract with fluid forms', 'https://picsum.photos/seed/art6/800/600', 5500.00, 'painting', ARRAY['abstract', 'modern', 'waves'], 'published', true),
      (user3, 'Geometric Patterns', 'Precise geometric composition', 'https://picsum.photos/seed/art7/800/600', 4800.00, 'digital', ARRAY['geometric', 'pattern', 'modern'], 'published', true);
  END IF;

  -- Update artwork counts
  UPDATE users SET artworks_count = (SELECT COUNT(*) FROM artworks WHERE user_id = users.id);
END $$;
```

Run seed:

```bash
psql -U your_username -d onlyarts < backend/seeds/artworks.sql
```

---

## Step 6: Test All Endpoints (30 min)

Create `backend/artwork-tests.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@accessToken = your-token-here
@artworkId = artwork-id-here

### 1. List all artworks
GET {{baseUrl}}/artworks

### 2. List with filters - category
GET {{baseUrl}}/artworks?category=digital&limit=10

### 3. List with price range
GET {{baseUrl}}/artworks?minPrice=3000&maxPrice=6000

### 4. List with search
GET {{baseUrl}}/artworks?search=sunset

### 5. List with tags
GET {{baseUrl}}/artworks?tags=abstract,modern

### 6. List sorted by price
GET {{baseUrl}}/artworks?sortBy=price&sortOrder=ASC

### 7. Get featured artworks
GET {{baseUrl}}/artworks/featured

### 8. Get artwork by ID
GET {{baseUrl}}/artworks/{{artworkId}}

### 9. Get artwork by ID (authenticated - shows isFavorited)
GET {{baseUrl}}/artworks/{{artworkId}}
Authorization: Bearer {{accessToken}}

### 10. Create new artwork
POST {{baseUrl}}/artworks
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "New Digital Art",
  "description": "This is a test artwork",
  "imageUrl": "https://picsum.photos/800/600",
  "price": 4500.00,
  "category": "digital",
  "tags": ["test", "digital", "art"],
  "status": "published"
}

### 11. Update artwork
PUT {{baseUrl}}/artworks/{{artworkId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 5500.00
}

### 12. Delete artwork
DELETE {{baseUrl}}/artworks/{{artworkId}}
Authorization: Bearer {{accessToken}}

### 13. Add to favorites
POST {{baseUrl}}/artworks/{{artworkId}}/favorite
Authorization: Bearer {{accessToken}}

### 14. Remove from favorites
DELETE {{baseUrl}}/artworks/{{artworkId}}/favorite
Authorization: Bearer {{accessToken}}

### 15. Get my favorites
GET {{baseUrl}}/artworks/favorites/me
Authorization: Bearer {{accessToken}}
```

---

## ✅ Day 5 Completion Checklist

- [ ] Artwork model created with all CRUD functions
- [ ] List artworks with comprehensive filters implemented
- [ ] Single artwork fetch with artist info
- [ ] Create artwork endpoint working
- [ ] Update artwork with ownership check
- [ ] Delete artwork with transaction
- [ ] View counter implemented
- [ ] Favorite/unfavorite system working
- [ ] Get favorites list
- [ ] Featured artworks endpoint
- [ ] Search functionality working
- [ ] All validation rules added
- [ ] Routes connected to server
- [ ] Test data seeded
- [ ] All endpoints tested
- [ ] Frontend artwork.service.js connected
- [ ] Artworks displaying in UI

---

## 🎯 Expected Outcome

By end of Day 5, you should have:

1. ✅ Complete artwork CRUD operations
2. ✅ Advanced filtering and search
3. ✅ Favorite system working
4. ✅ View tracking implemented
5. ✅ Artist info included with artworks
6. ✅ Frontend displaying real artwork data
7. ✅ Pagination working correctly

---

## 📝 Git Commit

```bash
git add backend/src/models/artwork.model.js backend/src/controllers/artwork.controller.js backend/src/routes/artwork.routes.js backend/server.js backend/seeds/artworks.sql backend/artwork-tests.http src/services/artwork.service.js
git commit -m "feat: Day 5 - Complete artwork management system

- Implement artwork CRUD operations
- Add advanced filtering (category, price, tags, search)
- Create favorite/unfavorite system
- Add view counter tracking
- Include artist info with artworks
- Support pagination and sorting
- Add featured artworks endpoint
- Seed test artwork data
- Connect frontend to real APIs

Endpoints:
- GET /api/artworks - List with filters
- GET /api/artworks/featured - Featured artworks
- GET /api/artworks/:id - Get single artwork
- POST /api/artworks - Create artwork
- PUT /api/artworks/:id - Update artwork
- DELETE /api/artworks/:id - Delete artwork
- POST /api/artworks/:id/favorite - Add to favorites
- DELETE /api/artworks/:id/favorite - Remove from favorites
- GET /api/artworks/favorites/me - Get my favorites

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 6

Tomorrow you'll implement:
- Cloudinary image upload
- Cart management (add, update, remove items)
- Get cart with full artwork details
- Clear cart functionality
