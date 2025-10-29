# Day 6: File Upload & Cart Management

**Goal:** Cloudinary image upload and complete cart functionality

**Time Estimate:** 4-5 hours

---

## Overview

Today you'll implement image upload with Cloudinary and complete shopping cart management matching [upload.service.js](src/services/upload.service.js) and [cart.service.js](src/services/cart.service.js).

**Features to Implement:**
- Cloudinary image upload (single and multiple)
- Get cart with full item details
- Add item to cart
- Update cart item quantity
- Remove item from cart
- Clear cart

---

## Step 1: Setup Cloudinary (20 min)

### Get Cloudinary Credentials

1. Go to https://cloudinary.com/
2. Sign up or login
3. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Install Dependencies

```bash
cd backend
npm install cloudinary multer
```

### Update .env

Add to `backend/.env`:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Step 2: Create Cloudinary Configuration (15 min)

Create `backend/src/config/cloudinary.js`:

```javascript
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional custom public ID
 * @returns {Promise<object>} Upload result
 */
const uploadImage = (fileBuffer, folder = 'onlyarts', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1920, height: 1920, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Automatic quality
        { fetch_format: 'auto' }, // Automatic format (WebP when supported)
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple images
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (fileBuffers, folder = 'onlyarts') => {
  const uploadPromises = fileBuffers.map((buffer) => uploadImage(buffer, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Delete multiple images
 * @param {Array<string>} publicIds - Array of public IDs
 * @returns {Promise<object>} Deletion result
 */
const deleteMultipleImages = async (publicIds) => {
  return cloudinary.api.delete_resources(publicIds);
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  cloudinary,
};
```

---

## Step 3: Create Upload Controller (25 min)

Create `backend/src/controllers/upload.controller.js`:

```javascript
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/response');
const { uploadImage, uploadMultipleImages } = require('../config/cloudinary');

/**
 * Upload single image
 * POST /api/upload/image
 */
const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  // Determine folder based on query param or default
  const folder = req.query.folder || 'onlyarts';

  // Upload to Cloudinary
  const result = await uploadImage(req.file.buffer, folder);

  successResponse(
    res,
    {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    },
    'Image uploaded successfully'
  );
});

/**
 * Upload multiple images
 * POST /api/upload/images
 */
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files uploaded', 400);
  }

  const folder = req.query.folder || 'onlyarts';

  // Upload all files to Cloudinary
  const fileBuffers = req.files.map((file) => file.buffer);
  const results = await uploadMultipleImages(fileBuffers, folder);

  const uploadedFiles = results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  }));

  successResponse(res, { files: uploadedFiles }, 'Images uploaded successfully');
});

module.exports = {
  uploadSingleImage,
  uploadMultiple,
};
```

---

## Step 4: Create Upload Routes (15 min)

Create `backend/src/routes/upload.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private
 * @query   folder - Optional Cloudinary folder (default: onlyarts)
 */
router.post(
  '/image',
  authenticate,
  upload.single('image'),
  uploadController.uploadSingleImage
);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images
 * @access  Private
 * @query   folder - Optional Cloudinary folder (default: onlyarts)
 */
router.post(
  '/images',
  authenticate,
  upload.array('images', 10), // Max 10 images
  uploadController.uploadMultiple
);

module.exports = router;
```

---

## Step 5: Create Cart Model (40 min)

Create `backend/src/models/cart.model.js`:

```javascript
const { query, pool } = require('../config/database');

/**
 * Get user's cart with full artwork details
 */
const getCart = async (userId) => {
  const result = await query(
    `SELECT
      ci.id as cart_item_id,
      ci.quantity,
      ci.added_at,
      a.id as artwork_id,
      a.title,
      a.description,
      a.image_url,
      a.price,
      a.category,
      a.status,
      a.is_for_sale,
      u.id as artist_id,
      u.username as artist_username,
      u.full_name as artist_name,
      u.profile_picture as artist_profile_picture
    FROM cart_items ci
    JOIN artworks a ON ci.artwork_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE ci.user_id = $1
    ORDER BY ci.added_at DESC`,
    [userId]
  );

  const items = result.rows.map((row) => ({
    id: row.cart_item_id,
    quantity: row.quantity,
    addedAt: row.added_at,
    artwork: {
      id: row.artwork_id,
      title: row.title,
      description: row.description,
      image: row.image_url,
      price: parseFloat(row.price),
      category: row.category,
      status: row.status,
      isForSale: row.is_for_sale,
      artist: {
        id: row.artist_id,
        username: row.artist_username,
        name: row.artist_name,
        profilePicture: row.artist_profile_picture,
      },
    },
  }));

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.artwork.price * item.quantity,
    0
  );

  return {
    items,
    subtotal,
    count: items.length,
  };
};

/**
 * Add item to cart
 */
const addToCart = async (userId, artworkId, quantity = 1) => {
  // Check if artwork exists and is for sale
  const artworkCheck = await query(
    'SELECT id, is_for_sale, status FROM artworks WHERE id = $1',
    [artworkId]
  );

  if (artworkCheck.rows.length === 0) {
    throw new Error('Artwork not found');
  }

  const artwork = artworkCheck.rows[0];

  if (!artwork.is_for_sale) {
    throw new Error('Artwork is not for sale');
  }

  if (artwork.status !== 'published') {
    throw new Error('Artwork is not available');
  }

  // Insert or update cart item
  const result = await query(
    `INSERT INTO cart_items (user_id, artwork_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, artwork_id)
     DO UPDATE SET quantity = cart_items.quantity + $3
     RETURNING id, quantity`,
    [userId, artworkId, quantity]
  );

  return result.rows[0];
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const result = await query(
    `UPDATE cart_items
     SET quantity = $1
     WHERE id = $2 AND user_id = $3
     RETURNING id, quantity`,
    [quantity, cartItemId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Cart item not found');
  }

  return result.rows[0];
};

/**
 * Remove item from cart
 */
const removeFromCart = async (userId, cartItemId) => {
  const result = await query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
    [cartItemId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Cart item not found');
  }

  return result.rows[0];
};

/**
 * Clear entire cart
 */
const clearCart = async (userId) => {
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};

/**
 * Get cart item count
 */
const getCartCount = async (userId) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM cart_items WHERE user_id = $1',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
};
```

---

## Step 6: Create Cart Controller (30 min)

Create `backend/src/controllers/cart.controller.js`:

```javascript
const { body, validationResult } = require('express-validator');
const CartModel = require('../models/cart.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user's cart
 * GET /api/cart
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const cart = await CartModel.getCart(userId);

  successResponse(res, cart);
});

/**
 * Add item to cart
 * POST /api/cart/items
 */
const addToCart = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const userId = req.user.userId;
  const { artworkId, quantity } = req.body;

  try {
    await CartModel.addToCart(userId, artworkId, quantity);

    // Get updated cart
    const cart = await CartModel.getCart(userId);

    successResponse(res, cart, 'Item added to cart', 201);
  } catch (error) {
    if (error.message === 'Artwork not found') {
      return errorResponse(res, 'Artwork not found', 404);
    }
    if (error.message === 'Artwork is not for sale') {
      return errorResponse(res, 'This artwork is not available for purchase', 400);
    }
    if (error.message === 'Artwork is not available') {
      return errorResponse(res, 'This artwork is not currently available', 400);
    }
    throw error;
  }
});

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }

  const userId = req.user.userId;
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    await CartModel.updateCartItem(userId, itemId, quantity);

    // Get updated cart
    const cart = await CartModel.getCart(userId);

    successResponse(res, cart, 'Cart item updated');
  } catch (error) {
    if (error.message === 'Cart item not found') {
      return errorResponse(res, 'Cart item not found', 404);
    }
    if (error.message === 'Quantity must be at least 1') {
      return errorResponse(res, 'Quantity must be at least 1', 400);
    }
    throw error;
  }
});

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { itemId } = req.params;

  try {
    await CartModel.removeFromCart(userId, itemId);

    // Get updated cart
    const cart = await CartModel.getCart(userId);

    successResponse(res, cart, 'Item removed from cart');
  } catch (error) {
    if (error.message === 'Cart item not found') {
      return errorResponse(res, 'Cart item not found', 404);
    }
    throw error;
  }
});

/**
 * Clear cart
 * DELETE /api/cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  await CartModel.clearCart(userId);

  successResponse(res, { items: [], subtotal: 0, count: 0 }, 'Cart cleared');
});

/**
 * Get cart count
 * GET /api/cart/count
 */
const getCartCount = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const count = await CartModel.getCartCount(userId);

  successResponse(res, { count });
});

// Validation rules
const addToCartValidation = [
  body('artworkId')
    .notEmpty()
    .withMessage('Artwork ID is required')
    .isUUID()
    .withMessage('Invalid artwork ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  addToCartValidation,
  updateCartItemValidation,
};
```

---

## Step 7: Create Cart Routes (15 min)

Create `backend/src/routes/cart.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/cart/count
 * @desc    Get cart item count
 * @access  Private
 */
router.get('/count', authenticate, cartController.getCartCount);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticate, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/items',
  authenticate,
  cartController.addToCartValidation,
  cartController.addToCart
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put(
  '/items/:itemId',
  authenticate,
  cartController.updateCartItemValidation,
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', authenticate, cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;
```

---

## Step 8: Connect Routes and Update Frontend (10 min)

Update `backend/server.js`:

```javascript
// API ROUTES
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/artworks', require('./src/routes/artwork.routes'));
app.use('/api/upload', require('./src/routes/upload.routes')); // Add this
app.use('/api/cart', require('./src/routes/cart.routes')); // Add this
```

Update [src/services/upload.service.js](src/services/upload.service.js):

```javascript
const USE_DEMO_MODE = false; // Changed from true
```

Update [src/services/cart.service.js](src/services/cart.service.js):

```javascript
const USE_DEMO_MODE = false; // Changed from true
```

---

## Step 9: Test Upload and Cart (40 min)

Create `backend/upload-cart-tests.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@accessToken = your-token
@artworkId = artwork-id
@cartItemId = cart-item-id

### ========== UPLOAD TESTS ==========

### 1. Upload single image
# Note: Use Postman or Thunder Client for file uploads
# This is just documentation
POST {{baseUrl}}/upload/image?folder=artworks
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

# Form data:
# image: [select file]

### 2. Upload multiple images
POST {{baseUrl}}/upload/images?folder=profile
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

# Form data:
# images: [select multiple files]

### ========== CART TESTS ==========

### 3. Get cart
GET {{baseUrl}}/cart
Authorization: Bearer {{accessToken}}

### 4. Get cart count
GET {{baseUrl}}/cart/count
Authorization: Bearer {{accessToken}}

### 5. Add to cart
POST {{baseUrl}}/cart/items
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "artworkId": "{{artworkId}}",
  "quantity": 1
}

### 6. Update cart item quantity
PUT {{baseUrl}}/cart/items/{{cartItemId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "quantity": 2
}

### 7. Remove from cart
DELETE {{baseUrl}}/cart/items/{{cartItemId}}
Authorization: Bearer {{accessToken}}

### 8. Clear cart
DELETE {{baseUrl}}/cart
Authorization: Bearer {{accessToken}}

### 9. Test add invalid artwork (should fail)
POST {{baseUrl}}/cart/items
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "artworkId": "00000000-0000-0000-0000-000000000000",
  "quantity": 1
}

### 10. Test invalid quantity (should fail)
POST {{baseUrl}}/cart/items
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "artworkId": "{{artworkId}}",
  "quantity": 0
}
```

Test upload with curl (example):

```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

---

## Step 10: Test in Frontend (20 min)

1. **Test Image Upload:**
   - Go to create artwork page
   - Upload an image
   - Verify it uploads to Cloudinary
   - Check imageUrl is saved

2. **Test Cart:**
   - Add artwork to cart
   - Update quantity
   - Remove item
   - Clear cart
   - Verify cart icon shows correct count

---

## ✅ Day 6 Completion Checklist

- [ ] Cloudinary account created and configured
- [ ] cloudinary package installed
- [ ] Cloudinary config file created
- [ ] Upload controller with single/multiple upload
- [ ] Upload routes defined
- [ ] Multer middleware working
- [ ] Upload tested with real image
- [ ] Cart model with all operations
- [ ] Cart controller created
- [ ] Cart routes defined
- [ ] Get cart endpoint working
- [ ] Add to cart working
- [ ] Update quantity working
- [ ] Remove item working
- [ ] Clear cart working
- [ ] Cart count endpoint working
- [ ] Frontend upload.service.js connected
- [ ] Frontend cart.service.js connected
- [ ] Image upload working in UI
- [ ] Cart operations working in UI

---

## 🎯 Expected Outcome

By end of Day 6, you should have:

1. ✅ Cloudinary image upload working
2. ✅ Multiple file upload supported
3. ✅ Complete cart management
4. ✅ Cart persists in database
5. ✅ Real-time cart count
6. ✅ Frontend can upload images
7. ✅ Frontend cart fully functional

---

## 🐛 Troubleshooting

### Cloudinary upload fails
- Check credentials in `.env`
- Verify Cloudinary account is active
- Check file size (5MB limit)
- Check file type (only images allowed)

### "Cannot read property 'buffer' of undefined"
- Ensure multer middleware is before controller
- Check form field name matches `upload.single('image')`
- Verify Content-Type is multipart/form-data

### Cart item not adding
- Check artwork exists: `SELECT * FROM artworks WHERE id = 'uuid'`
- Verify artwork is_for_sale = true
- Check artwork status = 'published'
- Verify user is authenticated

### Cart totals incorrect
- Check price is decimal, not string
- Verify quantity * price calculation
- Test with console.log in cart model

---

## 📝 Git Commit

```bash
git add backend/src/config/cloudinary.js backend/src/controllers/upload.controller.js backend/src/routes/upload.routes.js backend/src/models/cart.model.js backend/src/controllers/cart.controller.js backend/src/routes/cart.routes.js backend/server.js backend/upload-cart-tests.http backend/.env.example backend/package.json src/services/upload.service.js src/services/cart.service.js
git commit -m "feat: Day 6 - Cloudinary upload and cart management

- Setup Cloudinary for image uploads
- Implement single and multiple file upload
- Add image optimization and transformations
- Create complete cart management system
- Add cart with full artwork details
- Implement add, update, remove, clear cart
- Add cart item count endpoint
- Connect frontend to upload and cart APIs

Endpoints:
- POST /api/upload/image - Upload single image
- POST /api/upload/images - Upload multiple images
- GET /api/cart - Get cart
- GET /api/cart/count - Get cart count
- POST /api/cart/items - Add to cart
- PUT /api/cart/items/:id - Update quantity
- DELETE /api/cart/items/:id - Remove item
- DELETE /api/cart - Clear cart

🤖 Generated with Claude Code"
```

---

## 🚀 Next: Day 7

Tomorrow (final day of Week 1):
- Comprehensive testing of all endpoints
- Connect all remaining frontend services
- Fix any bugs found
- Add error logging
- Performance optimization
- Deployment preparation
- Documentation updates
