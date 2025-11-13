const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create subscription tiers
    console.log('📝 Creating subscription tiers...');
    await pool.query(`
      INSERT INTO subscription_tiers (name, description, price, duration_days, features, max_artworks, max_uploads_per_month, commission_rate) VALUES
      ('free', 'Basic features for casual users', 0.00, 365, '["Browse artworks", "Follow artists", "Basic messaging"]', 5, 2, 15.00),
      ('basic', 'For emerging artists', 9.99, 30, '["All Free features", "Unlimited artworks", "Priority support", "Analytics"]', NULL, 20, 12.00),
      ('premium', 'For professional artists', 29.99, 30, '["All Basic features", "Featured listings", "Advanced analytics", "Commission requests"]', NULL, 100, 10.00),
      ('professional', 'For established artists', 99.99, 30, '["All Premium features", "Custom storefront", "Priority placement", "Dedicated support"]', NULL, NULL, 5.00)
    `);
    console.log('✅ Subscription tiers created\n');

    // 2. Create test users
    console.log('📝 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const [artistResult] = await pool.query(`
      INSERT INTO users (username, email, password_hash, full_name, bio, role, is_verified, subscription_tier) VALUES
      ('artmaster', 'artist@onlyarts.com', ?, 'Sarah Martinez', 'Contemporary artist specializing in abstract paintings', 'artist', TRUE, 'premium'),
      ('photogeek', 'photo@onlyarts.com', ?, 'James Chen', 'Professional photographer capturing urban landscapes', 'artist', TRUE, 'basic'),
      ('sculptor_pro', 'sculptor@onlyarts.com', ?, 'Maria Rodriguez', 'Award-winning sculptor working with mixed media', 'artist', TRUE, 'professional'),
      ('collector123', 'buyer@onlyarts.com', ?, 'Michael Johnson', 'Art enthusiast and collector', 'user', TRUE, 'free'),
      ('artlover', 'lover@onlyarts.com', ?, 'Emily Davis', 'Supporting emerging artists', 'user', TRUE, 'basic')
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
    console.log('✅ Test users created\n');

    // 3. Create artworks
    console.log('📝 Creating artworks...');
    await pool.query(`
      INSERT INTO artworks (artist_id, title, description, price, category, medium, dimensions, year_created, status, stock_quantity) VALUES
      (1, 'Sunset Dreams', 'Abstract painting inspired by coastal sunsets', 1200.00, 'painting', 'Acrylic on canvas', '36x48 inches', 2024, 'published', 1),
      (1, 'Urban Chaos', 'Dynamic piece capturing city energy', 850.00, 'painting', 'Mixed media', '24x36 inches', 2024, 'published', 1),
      (1, 'Serenity', 'Peaceful abstract composition', 950.00, 'painting', 'Oil on canvas', '30x40 inches', 2023, 'published', 1),
      (2, 'City Lights at Night', 'Long exposure photography of downtown', 450.00, 'photography', 'Digital print', '20x30 inches', 2024, 'published', 5),
      (2, 'Morning Reflections', 'Architectural photography series', 380.00, 'photography', 'Digital print', '16x24 inches', 2024, 'published', 10),
      (3, 'Breaking Boundaries', 'Modern sculpture exploring form and space', 3500.00, 'sculpture', 'Bronze and steel', '48x24x24 inches', 2024, 'published', 1),
      (3, 'Fluid Motion', 'Contemporary sculpture in mixed media', 2200.00, 'sculpture', 'Resin and metal', '36x18x18 inches', 2023, 'published', 1)
    `);
    console.log('✅ Artworks created\n');

    // 4. Create follows
    console.log('📝 Creating follow relationships...');
    await pool.query(`
      INSERT INTO follows (follower_id, following_id) VALUES
      (4, 1), (4, 2), (4, 3),
      (5, 1), (5, 2),
      (1, 2), (1, 3),
      (2, 1), (2, 3),
      (3, 1), (3, 2)
    `);

    // Update follower counts
    await pool.query(`
      UPDATE users u SET
        follower_count = (SELECT COUNT(*) FROM follows WHERE following_id = u.id),
        following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = u.id)
    `);
    console.log('✅ Follow relationships created\n');

    // 5. Create likes
    console.log('📝 Creating likes...');
    await pool.query(`
      INSERT INTO likes (user_id, artwork_id) VALUES
      (4, 1), (4, 2), (4, 4), (4, 6),
      (5, 1), (5, 3), (5, 5),
      (1, 4), (1, 5), (1, 6),
      (2, 1), (2, 3), (2, 6)
    `);

    // Update like counts
    await pool.query(`
      UPDATE artworks a SET
        like_count = (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id)
    `);
    console.log('✅ Likes created\n');

    // 6. Create comments
    console.log('📝 Creating comments...');
    await pool.query(`
      INSERT INTO comments (artwork_id, user_id, content) VALUES
      (1, 4, 'Absolutely stunning! The colors are mesmerizing.'),
      (1, 5, 'Love the energy in this piece. Would look perfect in my living room!'),
      (4, 1, 'Beautiful composition! The lighting is perfect.'),
      (6, 4, 'This is a masterpiece. The detail is incredible.'),
      (2, 5, 'The movement in this painting is captivating!')
    `);

    // Update comment counts
    await pool.query(`
      UPDATE artworks a SET
        comment_count = (SELECT COUNT(*) FROM comments WHERE artwork_id = a.id)
    `);
    console.log('✅ Comments created\n');

    // 7. Update artwork counts
    await pool.query(`
      UPDATE users u SET
        artwork_count = (SELECT COUNT(*) FROM artworks WHERE artist_id = u.id)
    `);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   • 4 subscription tiers');
    console.log('   • 5 test users (3 artists, 2 collectors)');
    console.log('   • 7 artworks');
    console.log('   • Multiple follows, likes, and comments');
    console.log('\n✅ You can now test the API with this data!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
