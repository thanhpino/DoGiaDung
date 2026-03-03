// migrations/add_oauth_columns.js
// Chạy: node migrations/add_oauth_columns.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/database');

async function migrate() {
    const columns = [
        { name: 'provider', sql: "ALTER TABLE users ADD COLUMN provider VARCHAR(20) DEFAULT 'local'" },
        { name: 'provider_id', sql: "ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) DEFAULT NULL" },
        { name: 'avatar_url', sql: "ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL" }
    ];

    for (const col of columns) {
        try {
            await db.query(col.sql);
            console.log(`✅ Added column: ${col.name}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log(`⏭️ Column ${col.name} already exists`);
            } else {
                throw e;
            }
        }
    }

    await db.query("UPDATE users SET provider = 'local' WHERE provider IS NULL");
    console.log('✅ Set defaults done');
    process.exit(0);
}

migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
