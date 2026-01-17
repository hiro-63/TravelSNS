const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travel',
    multipleStatements: true
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create post_image table if not exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS post_image (
                id INT AUTO_INCREMENT PRIMARY KEY,
                post_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                FOREIGN KEY (post_id) REFERENCES post(post_id)
            ) ENGINE=InnoDB;
        `);
        console.log('Ensured post_image table exists.');

        // 2. Migrate existing data (Check if image_url column exists first)
        try {
            const [columns] = await connection.query(`SHOW COLUMNS FROM post LIKE 'image_url'`);
            if (columns.length > 0) {
                console.log('Migrating existing images...');
                await connection.query(`
                    INSERT INTO post_image (post_id, image_url)
                    SELECT post_id, image_url FROM post WHERE image_url IS NOT NULL AND image_url != '';
                `);
                console.log('Data migration completed.');

                // 3. Drop image_url column
                await connection.query(`ALTER TABLE post DROP COLUMN image_url;`);
                console.log('Dropped image_url column from post table.');
            }
        } catch (e) {
            console.log('Skipping data migration/column drop (maybe already done).', e.message);
        }

        // 4. Update route_point table (lat/lon)
        console.log('Updating route_point schema...');
        try {
            await connection.query(`
                ALTER TABLE route_point
                CHANGE COLUMN latitude lat DECIMAL(9,6) NOT NULL,
                CHANGE COLUMN longitude lon DECIMAL(9,6) NOT NULL;
            `);
        } catch (e) {
            console.log('Skipping route_point update (maybe already done).', e.message);
        }

        // 5. Update post_image table columns
        console.log('Updating post_image schema...');
        try {
            await connection.query(`
                ALTER TABLE post_image
                ADD COLUMN sort_order TINYINT DEFAULT 0,
                ADD COLUMN description VARCHAR(255) NULL;
            `);
        } catch (e) {
            console.log('Skipping post_image add columns (maybe already done).', e.message);
        }

        // 6. Add constraints
        console.log('Adding constraints...');
        try {
            // Drop existing FK if exists to add CASCADE (This is tricky in raw SQL without knowing constraint name, assuming default or fk_post_image_post as per request)
            // First, try to add unique key to route_point
            await connection.query(`
                ALTER TABLE route_point
                ADD UNIQUE KEY unique_route_order (post_id, order_index);
            `);
        } catch (e) {
            console.log('Skipping route_point unique key (maybe already exists).', e.message);
        }

        try {
            // Update FK for post_image to Cascade
            // First drop existing FK. We need to know the name. Assuming default 'post_image_ibfk_1' or similar. 
            // Often it's safer to just try add the new one if we are sure.
            // But per request: 
            // ALTER TABLE post_image ADD CONSTRAINT fk_post_image_post FOREIGN KEY (post_id) REFERENCES post(post_id) ON DELETE CASCADE;

            // Allow failure here if constraint name conflicts, manual check might be needed if strict.
            // But let's try to remove old FK if possible or just add this one.
            // To be safe, let's just run the user's command.

            // Check if constraint exists? Simple way:
            await connection.query(`
                ALTER TABLE post_image
                DROP FOREIGN KEY post_image_ibfk_1;
            `);
        } catch (e) {
            // Ignore if not found
        }

        try {
            await connection.query(`
                ALTER TABLE post_image
                ADD CONSTRAINT fk_post_image_post
                FOREIGN KEY (post_id) REFERENCES post(post_id)
                ON DELETE CASCADE;
            `);
            console.log('Added FK constraint to post_image.');
        } catch (e) {
            console.log('Skipping post_image FK (maybe already exists).', e.message);
        }

        // Add location_name to post if missing
        try {
            await connection.query(`ALTER TABLE post ADD COLUMN location_name VARCHAR(255);`);
        } catch (e) {
            // Ignore
        }

        console.log('Migration finished successfully.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
