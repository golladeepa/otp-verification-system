const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite DB Setup
const db = new sqlite3.Database('./auth.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Connected to SQLite database');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    otp TEXT,
    otp_expiry TEXT,
    otp_digits INTEGER DEFAULT 6
  )`);
});

// Gmail + Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'd14747106@gmail.com',
    pass: 'yohmarolytjvizcw'
  },
  tls: {
    rejectUnauthorized: false  // 🔥 Add this line for dev environments
  }
});

// Utility: Generate OTP
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// ✅ Register Endpoint
app.post('/register', async (req, res) => {
  const { email, password, mobile, otpDigits = 6 } = req.body;

  if (!email || !password || !mobile)
    return res.status(400).json({ message: 'Email, password, and mobile are required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password, mobile, otp_digits) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, mobile, otpDigits],
      function (err) {
        if (err) return res.status(400).json({ message: 'Email or mobile already exists' });

        res.status(201).json({ message: 'Registered successfully. Please login.' });
      }
    );
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login Endpoint (Sends OTP)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const otpLength = user.otp_digits || 6;
    const otp = generateOTP(otpLength);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    db.run('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, otpExpiry, user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update OTP' });

      const mailOptions = {
        from: 'boyasaikiran37@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        return res.json({ message: 'OTP sent to your email' });
      });
    });
  });
});

// ✅ OTP Verification Endpoint
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: 'Email and OTP are required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'User not found' });

    const now = new Date();
    const expiry = new Date(user.otp_expiry);

    if (user.otp !== otp || now > expiry)
      return res.status(401).json({ message: 'Invalid or expired OTP' });

    db.run('UPDATE users SET verified = 1, otp = NULL, otp_expiry = NULL WHERE id = ?', [user.id], (err) => {
      if (err) return res.status(500).json({ message: 'Verification failed' });

      const token = jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', {
        expiresIn: '1h'
      });

      res.json({ message: 'OTP verified successfully', token });
    });
  });
});

// ✅ Optional: Delete User
app.delete('/delete-user/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    res.json({ message: 'User deleted' });
  });
});

// ✅ Protected Route
app.get('/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    res.json({ message: 'Access granted', user: decoded });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});