require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Mongoose settings
mongoose.set('strictQuery', false);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Middleware with credentials
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://anocab.com',
      'https://www.anocab.com',
      'https://api.anocab.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === '*') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware (increased limit for image uploads)
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'anocab.sid', // Custom session name
  proxy: true, // Trust proxy (nginx)
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // lazy session update
    crypto: {
      secret: process.env.SESSION_SECRET || 'fallback-secret-key'
    }
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Prevent CSRF
    domain: process.env.NODE_ENV === 'production' ? '.anocab.com' : undefined,
    path: '/'
  }
}));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection (MongoDB Atlas)
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("💡 Check your MongoDB Atlas credentials and network access");
  });

// ==================== SCHEMAS ====================

// Apply Now Form Schema
const applyNowFormSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  phone_no: String,
  position_applied: String,
  qualification: String,
  experience: String,
  cover_letter: String,
  resume: { data: Buffer, contentType: String },
  createdAt: { type: Date, default: Date.now }
});
const ApplyNowForm = mongoose.model('ApplyNowForm', applyNowFormSchema);

// Enquiry Schema
const enquirySchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  company: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// MRP Data Schema
const mrpDataSchema = new mongoose.Schema({
  productName: String,
  size: String,
  mrp: Number,
  updatedAt: { type: Date, default: Date.now }
});
const MrpData = mongoose.model('MrpData', mrpDataSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, default: 'Anocab Team' },
  category: { type: String, default: '📊 Price Updates' },
  tags: [String],
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', blogSchema);

// Client Logo Schema
const clientLogoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const ClientLogo = mongoose.model('ClientLogo', clientLogoSchema);

// ==================== NODEMAILER SETUP ====================

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ==================== MULTER SETUP ====================

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept PDFs for resumes and images for blogs
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ==================== AUTHENTICATION MIDDLEWARE ====================

function isAuthenticated(req, res, next) {
  console.log('🔐 Auth check:', {
    hasSession: !!req.session,
    isAuthenticated: req.session?.isAuthenticated,
    sessionID: req.sessionID,
    cookies: req.headers.cookie
  });
  
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ status: 'error', message: 'Unauthorized. Please login.' });
}

// ==================== AUTH ROUTES ====================

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log('Login attempt:', { email, adminEmail, passwordMatch: password === adminPassword });
  
  if (email === adminEmail && password === adminPassword) {
    req.session.isAuthenticated = true;
    req.session.userEmail = email;
    req.session.role = 'admin';
    req.session.loginTime = new Date();
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

// ==================== PRICE MARQUEE ROUTES ====================

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

// Get current prices (public)
app.get('/api/prices', (req, res) => {
  fs.readFile(PRICES_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading prices:', err);
      return res.status(500).json({ error: 'Error reading prices' });
    }
    res.json(JSON.parse(data));
  });
});

// Update prices (protected)
app.post('/update-prices', isAuthenticated, (req, res) => {
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
      return res.status(500).json({ status: 'error', error: 'Error saving prices' });
    }
    // Return JSON response instead of redirect
    res.json({ status: 'success', message: 'Prices updated successfully', prices: newPrices });
  });
});

// Get approved prices (protected)
app.get('/api/prices/approved', isAuthenticated, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // For now, return empty array since we don't have a price approval system yet
  res.json({
    prices: [],
    total: 0,
    page,
    totalPages: 0
  });
});

// Get pending prices (protected)
app.get('/api/prices/pending', isAuthenticated, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // For now, return empty array since we don't have a price approval system yet
  res.json({
    prices: [],
    total: 0,
    page,
    totalPages: 0
  });
});

// Get rejected prices (protected)
app.get('/api/prices/rejected', isAuthenticated, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // For now, return empty array since we don't have a price approval system yet
  res.json({
    prices: [],
    total: 0,
    page,
    totalPages: 0
  });
});

// ==================== MRP ROUTES ====================

// Get latest MRP data
app.get('/api/mrp/latest', async (req, res) => {
  try {
    const { productName } = req.query;
    const query = productName ? { productName } : {};
    const mrpData = await MrpData.find(query).sort({ updatedAt: -1 });
    res.json(mrpData);
  } catch (error) {
    console.error('Error fetching MRP:', error);
    res.status(500).json({ error: 'Error fetching MRP data' });
  }
});

// Update MRP (protected)
app.post('/api/mrp/update', isAuthenticated, async (req, res) => {
  try {
    const { productName, size, mrp } = req.body;
    
    await MrpData.findOneAndUpdate(
      { productName, size },
      { productName, size, mrp, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json({ status: 'success', message: 'MRP updated successfully' });
  } catch (error) {
    console.error('Error updating MRP:', error);
    res.status(500).json({ error: 'Error updating MRP' });
  }
});

// ==================== ENQUIRY ROUTES ====================

// Submit newsletter subscription
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ status: 'error', message: 'Already subscribed' });
      } else {
        // Reactivate subscription
        existing.active = true;
        await existing.save();
        return res.json({ status: 'success', message: 'Subscription reactivated' });
      }
    }
    
    // Create new subscription
    const newsletter = new Newsletter({ email });
    await newsletter.save();
    
    // Send welcome email (optional - won't fail if email config is wrong)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: 'Welcome to ANOCAB Newsletter! 🎉',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #013A5B 0%, #1f2f3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .feature { margin: 15px 0; padding-left: 25px; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                .button { background: #013A5B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Hi 👋</h1>
                  <h2>Thank you for subscribing to ANOCAB! 🎉</h2>
                </div>
                <div class="content">
                  <p>You're now part of our updates list — and that means you'll be among the first to know about:</p>
                  
                  <div class="feature">✔️ Latest aluminium wire prices 📊</div>
                  <div class="feature">✔️ Daily/weekly rate updates 🔄</div>
                  <div class="feature">✔️ Exclusive offers & deals 💰</div>
                  <div class="feature">✔️ Important market changes 📉📈</div>
                  <div class="feature">✔️ Hiring updates & career opportunities 💼</div>
                  
                  <p style="margin-top: 25px;">We'll keep you informed with updates that matter to you 🔔</p>
                  
                  <p style="margin-top: 25px; color: #666; font-size: 14px;">
                    If you did not subscribe, you can ignore this email. You can unsubscribe anytime.
                  </p>
                  
                  <p style="margin-top: 30px;">Thanks 🙌,<br><strong>Team ANOCAB</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 Anode Electric Pvt Ltd. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.warn('⚠️ Email sending failed (subscription still saved):', emailError.message);
      }
    }
    
    res.json({ status: 'success', message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ status: 'error', message: 'Subscription failed' });
  }
});

// Get all newsletter subscribers (protected)
app.get('/api/newsletter', isAuthenticated, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ active: true }).sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Error fetching subscribers' });
  }
});

// Send bulk email to subscribers (protected)
app.post('/api/newsletter/send-bulk', isAuthenticated, async (req, res) => {
  try {
    const { subject, htmlContent, selectedEmails } = req.body;
    
    if (!subject || !htmlContent) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }
    
    // Get subscribers to send to
    let recipients;
    if (selectedEmails && selectedEmails.length > 0) {
      recipients = selectedEmails;
    } else {
      // Send to all active subscribers
      const subscribers = await Newsletter.find({ active: true });
      recipients = subscribers.map(sub => sub.email);
    }
    
    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients found' });
    }
    
    // Send emails
    let successCount = 0;
    let failCount = 0;
    
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: subject,
          html: htmlContent
        });
        successCount++;
        console.log(`✅ Email sent to: ${email}`);
      } catch (emailError) {
        failCount++;
        console.error(`❌ Failed to send to ${email}:`, emailError.message);
      }
    }
    
    res.json({ 
      status: 'success', 
      message: `Emails sent: ${successCount} successful, ${failCount} failed`,
      successCount,
      failCount,
      totalRecipients: recipients.length
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ error: 'Error sending bulk emails' });
  }
});

// Submit enquiry
app.post('/api/enquiry', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    
    // Send email notification to admin (optional)
    if (process.env.MAIL_USER && process.env.MAIL_PASS && process.env.ADMIN_EMAIL) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `New Enquiry from ${req.body.fullName}`,
          html: `
            <h2>New Enquiry Received</h2>
            <p><strong>Name:</strong> ${req.body.fullName}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Phone:</strong> ${req.body.phone}</p>
            <p><strong>Company:</strong> ${req.body.company}</p>
            <p><strong>Message:</strong> ${req.body.message}</p>
          `
        });
        console.log('✅ Enquiry notification sent');
      } catch (emailError) {
        console.warn('⚠️ Email notification failed (enquiry still saved):', emailError.message);
      }
    }
    
    res.json({ status: 'success', message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({ error: 'Error submitting enquiry' });
  }
});

// Get all enquiries (protected)
app.get('/api/enquiry', isAuthenticated, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Error fetching enquiries' });
  }
});

// ==================== JOB APPLICATION ROUTES ====================

// Submit job application
app.post('/submit-form', upload.single('resume'), async (req, res) => {
  try {
    const formData = new ApplyNowForm({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_no: req.body.phone_no,
      position_applied: req.body.position_applied,
      qualification: req.body.qualification,
      experience: req.body.experience,
      cover_letter: req.body.cover_letter,
      resume: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await formData.save();

    // Send confirmation email to applicant (optional)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: req.body.email,
          subject: 'Application Received - Anocab',
          html: `
            <h2>Thank you for your application!</h2>
            <p>Dear ${req.body.first_name} ${req.body.last_name},</p>
            <p>We have received your application for the position of <strong>${req.body.position_applied}</strong>.</p>
            <p>We will review your application and get back to you soon.</p>
            <br>
            <p>Best regards,<br>Anocab Team</p>
          `
        });

        // Send notification to admin
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: process.env.NOTIFICATION_EMAIL || process.env.MAIL_USER,
          subject: `New Job Application - ${req.body.position_applied}`,
          html: `
            <h2>New Job Application Received</h2>
            <p><strong>Name:</strong> ${req.body.first_name} ${req.body.last_name}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Phone:</strong> ${req.body.phone_no}</p>
            <p><strong>Position:</strong> ${req.body.position_applied}</p>
            <p><strong>Qualification:</strong> ${req.body.qualification}</p>
            <p><strong>Experience:</strong> ${req.body.experience}</p>
            <p><strong>Cover Letter:</strong> ${req.body.cover_letter}</p>
          `
        });
        console.log('✅ Application emails sent');
      } catch (emailError) {
        console.warn('⚠️ Email sending failed (application still saved):', emailError.message);
      }
    }

    res.json({ status: 'success', message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Error submitting application' });
  }
});

// Get all applications (protected)
app.get('/fetch-forms', isAuthenticated, async (req, res) => {
  try {
    const forms = await ApplyNowForm.find().select('-resume.data').sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Error fetching forms' });
  }
});

// Download resume (protected)
app.get('/download-resume/:id', isAuthenticated, async (req, res) => {
  try {
    const form = await ApplyNowForm.findById(req.params.id);
    if (!form || !form.resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.contentType(form.resume.contentType);
    res.send(form.resume.data);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Error downloading resume' });
  }
});

// ==================== BLOG ROUTES ====================

// Upload blog image (protected)
app.post('/api/admin/blogs/upload-image', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert to base64 for temporary storage
    // RECOMMENDED: Upload to Cloudinary instead for production
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    res.json({ 
      status: 'success', 
      message: 'Image uploaded successfully. For better performance, consider using Cloudinary URLs.',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

// Get all published blogs (public)
app.get('/api/blogs', async (req, res) => {
  try {
    const { limit = 6, category, tag } = req.query;
    const query = { published: true };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-content');
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    // Return empty array instead of error to prevent frontend crash
    res.json([]);
  }
});

// Get single blog by slug (public)
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    // Get related blogs (same category, exclude current)
    const relatedBlogs = await Blog.find({
      published: true,
      category: blog.category,
      _id: { $ne: blog._id }
    })
    .limit(3)
    .select('-content');
    
    res.json({ blog, relatedBlogs });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Error fetching blog' });
  }
});

// Get all blogs for admin (protected)
app.get('/api/admin/blogs', isAuthenticated, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Error fetching blogs' });
  }
});

// Create new blog (protected)
app.post('/api/admin/blogs', isAuthenticated, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, tags, published } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      image,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      published: published === 'true' || published === true
    });
    
    await blog.save();
    res.json({ status: 'success', message: 'Blog created successfully', blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Error creating blog' });
  }
});

// Update blog (protected)
app.put('/api/admin/blogs/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, tags, published } = req.body;
    
    const updateData = {
      title,
      excerpt,
      content,
      image,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      published: published === 'true' || published === true,
      updatedAt: new Date()
    };
    
    // Update slug if title changed
    if (title) {
      updateData.slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ status: 'success', message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Error updating blog' });
  }
});

// Delete blog (protected)
app.delete('/api/admin/blogs/:id', isAuthenticated, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ status: 'success', message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Error deleting blog' });
  }
});

// ==================== CLIENT LOGO ROUTES ====================

// Get all active client logos (public)
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await ClientLogo.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return empty array instead of error to prevent frontend crash
    res.json([]);
  }
});

// Get all client logos for admin (protected)
app.get('/api/admin/clients', isAuthenticated, async (req, res) => {
  try {
    const clients = await ClientLogo.find().sort({ order: 1, createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

// Create new client logo (protected)
app.post('/api/admin/clients', isAuthenticated, async (req, res) => {
  try {
    const { name, logo, order, active } = req.body;
    
    const client = new ClientLogo({
      name,
      logo,
      order: order || 0,
      active: active !== false
    });
    
    await client.save();
    res.json({ status: 'success', message: 'Client added successfully', client });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Error creating client' });
  }
});

// Update client logo (protected)
app.put('/api/admin/clients/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, logo, order, active } = req.body;
    
    const client = await ClientLogo.findByIdAndUpdate(
      req.params.id,
      { name, logo, order, active },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ status: 'success', message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Error updating client' });
  }
});

// Delete client logo (protected)
app.delete('/api/admin/clients/:id', isAuthenticated, async (req, res) => {
  try {
    const client = await ClientLogo.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ status: 'success', message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Error deleting client' });
  }
});

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ==================== START SERVER ====================

// Serve API config endpoint for frontend (public endpoint)
app.get('/api/config', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.json({
    apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve global config script
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  const apiUrl = process.env.API_BASE_URL || `http://localhost:${PORT}`;
  res.send(`
// Auto-generated API configuration
window.API_BASE_URL = '${apiUrl}';
console.log('🌐 API Base URL:', window.API_BASE_URL);
  `.trim());
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Anocab Unified Backend Server`);
  console.log(`${'='.repeat(50)}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📧 Admin: ${process.env.ADMIN_EMAIL}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
});
