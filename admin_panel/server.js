require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for correct req.secure/req.protocol behind nginx
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root directory

// JWT Helper Functions
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-jwt-secret');
  } catch (error) {
    return null;
  }
}

// Authentication middleware
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized. Please login.' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
  }
  
  req.user = decoded;
  return next();
}

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
