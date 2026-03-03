require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

const app = express();

// Session store
const sessionStore = new MySQLStore({}, pool);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../views/404.html'));
});

// Error handler
app.use(errorHandler);

module.exports = app;