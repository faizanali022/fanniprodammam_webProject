const mysql = require('mysql2');
require('dotenv').config();

// MySQL connection pool (better than single connection)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'TeaMusicPeace',
    database: process.env.DB_NAME || 'fanni_pro_dammam',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL connection error:', err.message);
        console.log('Trying to create database if not exists...');
        createDatabaseIfNotExists();
        return;
    }
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'fanni_pro_dammam');
    connection.release();
    createTablesIfNotExist();
});

// Function to create database if it doesn't exist
function createDatabaseIfNotExists() {
    const tempConnection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    tempConnection.connect((err) => {
        if (err) {
            console.error('❌ Cannot connect to MySQL server:', err.message);
            return;
        }

        const dbName = process.env.DB_NAME || 'fanni_pro_dammam';
        
        tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, (err) => {
            if (err) {
                console.error('❌ Error creating database:', err.message);
                return;
            }
            
            console.log(`✅ Database '${dbName}' created or already exists`);
            tempConnection.end();
        });
    });
}

// Function to create all tables if they don't exist
function createTablesIfNotExist() {
    const tables = {
        admins: `CREATE TABLE IF NOT EXISTS admins (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            email VARCHAR(100),
            role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        bookings: `CREATE TABLE IF NOT EXISTS bookings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            service_type VARCHAR(100) NOT NULL,
            service_date DATE NOT NULL,
            time_slot VARCHAR(50) NOT NULL,
            description TEXT,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            area VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            notes TEXT,
            status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        contact_messages: `CREATE TABLE IF NOT EXISTS contact_messages (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            service VARCHAR(100),
            message TEXT NOT NULL,
            status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        services: `CREATE TABLE IF NOT EXISTS services (
            id INT PRIMARY KEY AUTO_INCREMENT,
            service_name VARCHAR(100) NOT NULL,
            service_description TEXT,
            category VARCHAR(50),
            base_price DECIMAL(10,2),
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    };

    // Execute table creation queries
    Object.keys(tables).forEach((tableName) => {
        pool.query(tables[tableName], (err) => {
            if (err) {
                console.error(`❌ Error creating table '${tableName}':`, err.message);
            } else {
                console.log(`✅ Table '${tableName}' created or already exists`);
            }
        });
    });
}

// Insert default admin user if not exists
function insertDefaultAdmin() {
    const checkAdminQuery = 'SELECT COUNT(*) as count FROM admins';
    pool.query(checkAdminQuery, (err, results) => {
        if (err) {
            console.error('❌ Error checking admin users:', err.message);
            return;
        }
        
        if (results[0].count === 0) {
            const insertAdminQuery = 'INSERT INTO admins (username, password, full_name, email) VALUES (?, ?, ?, ?)';
            pool.query(insertAdminQuery, ['admin', 'admin123', 'Super Admin', 'admin@fanniprodammam.com'], (err) => {
                if (err) {
                    console.error('❌ Error inserting default admin:', err.message);
                } else {
                    console.log('✅ Default admin user created (username: admin, password: admin123)');
                }
            });
        }
    });
}

// Insert default services
function insertDefaultServices() {
    const checkServicesQuery = 'SELECT COUNT(*) as count FROM services';
    pool.query(checkServicesQuery, (err, results) => {
        if (err) {
            console.error('❌ Error checking services:', err.message);
            return;
        }
        
        if (results[0].count === 0) {
            const defaultServices = [
                ['Plumbing Services', 'Pipe repairs, fixture installation, drain cleaning', 'plumbing', 150.00],
                ['Electrical Work', 'Wiring, lighting, outlets, switches repair', 'electrical', 200.00],
                ['General Repairs', 'Furniture assembly, door/window repairs, general maintenance', 'general', 120.00],
                ['Painting Services', 'Interior/exterior painting, wall preparation', 'painting', 300.00],
                ['Furniture Assembly', 'Flat-pack furniture assembly and setup', 'assembly', 100.00]
            ];
            
            const insertServiceQuery = 'INSERT INTO services (service_name, service_description, category, base_price) VALUES ?';
            pool.query(insertServiceQuery, [defaultServices], (err) => {
                if (err) {
                    console.error('❌ Error inserting default services:', err.message);
                } else {
                    console.log('✅ Default services added to database');
                }
            });
        }
    });
}

// Export the pool for use in other files
module.exports = pool;