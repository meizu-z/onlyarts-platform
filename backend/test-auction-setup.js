const db = require('./src/config/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function setup() {
  try {
    // Get users
    const users = await db.query(
      'SELECT id, username, email, subscription_tier FROM users LIMIT 10'
    );

    // Get artworks
    const artworks = await db.query(
      'SELECT id, title, artist_id FROM artworks LIMIT 5'
    );

    console.log('\n=== AVAILABLE USERS ===');
    console.table(users.rows);

    console.log('\n=== AVAILABLE ARTWORKS ===');
    console.table(artworks.rows);

    // Find premium and free users
    const premiumUser = users.rows.find(u => u.subscription_tier === 'premium' || u.subscription_tier === 'Premium');
    const freeUser = users.rows.find(u => !u.subscription_tier || u.subscription_tier === 'free' || u.subscription_tier === 'Free');

    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'your-secret-key';

    console.log('\n=== TEST TOKENS ===\n');

    if (premiumUser) {
      const token = jwt.sign(
        {
          userId: premiumUser.id,
          username: premiumUser.username,
          email: premiumUser.email,
          subscription_tier: premiumUser.subscription_tier
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      console.log('PREMIUM USER:');
      console.log('  Username:', premiumUser.username);
      console.log('  ID:', premiumUser.id);
      console.log('  Tier:', premiumUser.subscription_tier);
      console.log('  Token:', token);
      console.log('');
    } else {
      console.log('⚠️  No premium users found in database');
    }

    if (freeUser) {
      const token = jwt.sign(
        {
          userId: freeUser.id,
          username: freeUser.username,
          email: freeUser.email,
          subscription_tier: freeUser.subscription_tier || 'free'
        },
        jwtSecret,
        { expiresIn: '24h' }
      );
      console.log('FREE USER:');
      console.log('  Username:', freeUser.username);
      console.log('  ID:', freeUser.id);
      console.log('  Tier:', freeUser.subscription_tier || 'free');
      console.log('  Token:', token);
      console.log('');
    } else {
      console.log('⚠️  No free users found in database');
    }

    if (artworks.rows.length > 0) {
      console.log('\n=== TEST ARTWORK ===');
      console.log('  ID:', artworks.rows[0].id);
      console.log('  Title:', artworks.rows[0].title);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setup();
