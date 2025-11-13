# How to Create MySQL Tables - OnlyArts Platform

This guide shows you how to create and manage MySQL database tables for the OnlyArts platform.

## 📋 Table of Contents
1. [Method 1: Using Command Line (Fastest)](#method-1-command-line)
2. [Method 2: Using MySQL Workbench (GUI)](#method-2-mysql-workbench)
3. [Method 3: Using VS Code/Text Editor](#method-3-vs-code)
4. [View Tables](#view-tables)
5. [Troubleshooting](#troubleshooting)

---

## Method 1: Command Line (Fastest) ✅

### Step 1: Open Command Prompt or PowerShell

Press `Win + R`, type `cmd`, and press Enter.

### Step 2: Run the Migration File

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pYourPassword < path\to\migration.sql
```

**Example (for OnlyArts):**
```bash
cd C:\Users\meizu\onlyarts-git\onlyarts-platform

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! < backend/database/migrations/003_add_new_features.sql
```

✅ **That's it!** Tables are created.

---

## Method 2: MySQL Workbench (GUI)

### Step 1: Open MySQL Workbench
- Launch MySQL Workbench from Start Menu
- Connect to your local MySQL server

### Step 2: Open SQL File
1. Click **File** → **Open SQL Script**
2. Navigate to: `backend/database/migrations/003_add_new_features.sql`
3. Click **Open**

### Step 3: Execute the Script
1. Click the **⚡ Execute** button (lightning icon)
2. Wait for completion message
3. Check **Output** panel for success

---

## Method 3: VS Code/Text Editor

### Step 1: Copy SQL Content
Open the migration file and copy all SQL code:
```
backend/database/migrations/003_add_new_features.sql
```

### Step 2: Run in MySQL Command Line
```bash
# Open MySQL command line
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123!

# In MySQL prompt:
USE onlyarts;

# Paste the SQL content and press Enter
```

---

## 📊 View Tables

### Show All Tables
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SHOW TABLES;"
```

### View Table Structure
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; DESCRIBE commissions;"
```

### View Table Data
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SELECT * FROM commissions LIMIT 5;"
```

---

## 🆕 New Tables Created

After running the migration, you should have these **new** tables:

### 1. **Commissions System**
- `commissions` - Commission requests between clients and artists
- `commission_messages` - Messages in commission threads

### 2. **Subscription Management**
- `subscription_history` - Track subscription changes over time

### 3. **Exhibition System**
- `exhibitions` - User-created art exhibitions
- `exhibition_artworks` - Artworks in exhibitions
- `exhibition_likes` - Users who liked exhibitions

### 4. **Livestream System**
- `livestreams` - Artist livestream sessions

### 5. **Chat/Messaging**
- `conversations` - Chat conversations between users
- `messages` - Individual messages in conversations

---

## 🔧 Troubleshooting

### Error: "Access denied"
```
Solution: Check your MySQL username and password
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
(Enter password when prompted)
```

### Error: "Database not found"
```sql
-- Create database first
CREATE DATABASE onlyarts;
USE onlyarts;
```

### Error: "Table already exists"
```
This is OK! The script uses CREATE TABLE IF NOT EXISTS.
Your tables are already there.
```

### How to Delete a Table (Careful!)
```sql
DROP TABLE IF EXISTS table_name;
```

### How to Delete All Tables (Very Careful!)
```sql
-- Only do this if you want to start fresh!
DROP DATABASE onlyarts;
CREATE DATABASE onlyarts;
```

---

## 📝 Creating New Migrations

When you need to add new tables or columns:

### Step 1: Create Migration File
```
backend/database/migrations/004_your_feature_name.sql
```

### Step 2: Write SQL
```sql
USE onlyarts;

CREATE TABLE IF NOT EXISTS your_new_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Run Migration
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! < backend/database/migrations/004_your_feature_name.sql
```

---

## 🎯 Quick Reference Commands

### Login to MySQL
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

### Select Database
```sql
USE onlyarts;
```

### Show All Tables
```sql
SHOW TABLES;
```

### Describe Table Structure
```sql
DESCRIBE table_name;
```

### Count Rows
```sql
SELECT COUNT(*) FROM table_name;
```

### View Recent Records
```sql
SELECT * FROM table_name ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ Success Checklist

After running migrations, verify:

- [ ] All tables exist: `SHOW TABLES;`
- [ ] No errors in output
- [ ] Tables have correct structure: `DESCRIBE table_name;`
- [ ] Backend server starts without errors
- [ ] API endpoints work

---

## 🆘 Need Help?

### Check Migration Status
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "USE onlyarts; SHOW TABLES;"
```

### View Error Logs
- Check MySQL error log: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
- Check backend logs: Look at terminal where backend is running

### Reset Database (Nuclear Option)
```bash
# Backup first!
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -pPassword123! onlyarts > backup.sql

# Drop and recreate
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! -e "DROP DATABASE onlyarts; CREATE DATABASE onlyarts;"

# Run all migrations in order
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pPassword123! < backend/database/schema.sql
```

---

**Status**: ✅ All tables created successfully!

Last updated: 2025-11-07
