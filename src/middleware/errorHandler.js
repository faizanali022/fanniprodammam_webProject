const path = require('path');

module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).sendFile(path.join(__dirname, '../../views/500.html'));
};