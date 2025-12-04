const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/database');

async function runMigration() {
  const migrationPath = path.join(__dirname, 'migrations', 'add_is_admin_column.sql');

  try {
    console.log('Reading migration file...');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments and split into individual statements
    const lines = sql.split('\n');
    const sqlWithoutComments = lines
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sqlWithoutComments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    const connection = await pool.getConnection();

    try {
      console.log('Starting migration...');

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        // Skip comment-only statements
        if (stmt.startsWith('--') || stmt.length === 0) continue;

        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(stmt.substring(0, 100) + '...');

        await connection.query(stmt);
        console.log('✅ Success');
      }

      console.log('\n✅ Migration completed successfully!');

      // Verify the changes
      console.log('\nVerifying changes...');
      const [rows] = await connection.query(
        'SELECT id, username, role, is_admin FROM users LIMIT 5'
      );
      console.log('\nSample users after migration:');
      console.table(rows);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
