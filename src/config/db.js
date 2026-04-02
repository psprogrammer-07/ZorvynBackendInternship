// src/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../db.sqlite');
const schemaPath = path.resolve(__dirname, '../../schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Successfully connected to SQLite database.');
        initializeDB();
    }
});

function initializeDB() {
    try {
        // Read the SQL file as a string
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the SQL to ensure tables exist
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error executing schema.sql:', err.message);
            } else {
                console.log('Database tables verified/created successfully.');
            }
        });
    } catch (err) {
        console.error('Failed to read schema.sql file:', err.message);
    }
}

module.exports = db;