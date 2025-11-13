const { query, pool } = require('../config/database');

async function testDb() {
  try {
    console.log('Testing MySQL connection...');
    const result = await query('SELECT NOW() as now');
    console.log('✅ Query successful. Server time from DB:', result.rows[0].now);

    // close pool gracefully
    await pool.end();
    console.log('Connection pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database test failed:', err.message || err);
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

testDb();
