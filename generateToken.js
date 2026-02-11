const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // HARDCODE THE KEY TEMPORARILY
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;