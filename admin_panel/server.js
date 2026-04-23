require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for correct req.secure/req.protocol behind nginx
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'anocab.admin.sid',
  cookie: { 
    secure: process.env.NODE_ENV === 'production' ? 'auto' : false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root directory

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ status: 'error', message: 'Unauthorized. Please login.' });
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (email === adminEmail && password === adminPassword) {
    req.session.isAuthenticated = true;
    req.session.userEmail = email;
    req.session.role = 'admin';
    return res.json({ 
      status: 'success', 
      message: 'Login successful',
      role: 'admin'
    });
  } else {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid email or password' 
    });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Logout failed' });
    }
    res.json({ status: 'success', message: 'Logged out successfully' });
  });
});

// Check authentication status
app.get('/check-auth', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.json({ 
      authenticated: true, 
      role: req.session.role,
      email: req.session.userEmail 
    });
  }
  return res.json({ authenticated: false });
});

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Price file path
const PRICES_FILE = path.join(__dirname, 'prices.json');

// Initialize prices file if it doesn't exist
if (!fs.existsSync(PRICES_FILE)) {
  fs.writeFileSync(PRICES_FILE, JSON.stringify({
    aluminum_ec: 275.50,
    aluminum_alloy: 283.00,
    copper: 912.02,
    pvc: 92.63,
    lldpe: 105.52
  }, null, 2));
}

// API to get current prices
app.get('/api/prices', (req, res) => {
  fs.readFile(PRICES_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading prices:', err);
      return res.status(500).json({ error: 'Error reading prices' });
    }
    res.json(JSON.parse(data));
  });
});

// Handle form submission from admin (protected route)
app.post('/update-prices', isAuthenticated, express.json(), (req, res) => {
  const newPrices = {
    aluminum_ec: parseFloat(req.body.price_aluminum_ec),
    aluminum_alloy: parseFloat(req.body.price_aluminum_alloy),
    copper: parseFloat(req.body.price_copper),
    pvc: parseFloat(req.body.price_pvc),
    lldpe: parseFloat(req.body.price_lldpe)
  };

  fs.writeFile(PRICES_FILE, JSON.stringify(newPrices, null, 2), (err) => {
    if (err) {
      console.error('Error saving prices:', err);
      return res.status(500).json({ status: 'error', message: 'Error saving prices' });
    }
    return res.json({ status: 'success', message: 'Prices updated successfully', prices: newPrices });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Admin Panel Server running on http://localhost:${PORT}`);
  console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
