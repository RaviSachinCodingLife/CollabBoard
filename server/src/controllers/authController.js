const User = require('../models/User');
const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ message: 'Server error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('login', err);
    res.status(500).json({ message: 'Server error logging in' });
  }
};
