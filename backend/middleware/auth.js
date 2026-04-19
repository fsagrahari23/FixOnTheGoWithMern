const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(req, res, next) {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email and password are required' });
    }

    name = name.trim();
    email = email.toLowerCase().trim();

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    req.body.name = name;
    req.body.email = email;

    next();
}

function validateLogin(req, res, next) {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    email = email.toLowerCase().trim();

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    req.body.email = email;

    next();
}

module.exports = {
    validateSignup,
    validateLogin,
};