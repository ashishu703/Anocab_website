const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config();

// Access admin credentials from .env
const adminEmail = process.env.adminEmail;
const adminPassword = process.env.adminPassword;

// Example: Use these credentials for authentication or logging
console.log('Admin Email:', adminEmail); // Remove this in production
// You can use adminEmail and adminPassword in your login logic

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));
app.use(express.json());

// --- Price Marquee Logic from admin_panel/server.js ---
const fs = require('fs');

// --- Apply Now Logic (pure logic only, for integration) ---
const multer = require('multer');
const nodemailer = require('nodemailer');

// MongoDB Schema (Storing PDF as Buffer)
const applyNowFormSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  phone_no: String,
  position_applied: String,
  qualification: String,
  experience: String,
  cover_letter: String,
  resume: { data: Buffer, contentType: String }, // Store PDF as binary
});
const ApplyNowForm = mongoose.model('ApplyNowForm', applyNowFormSchema);

// Multer setup for file uploads (resume)
const applyNowStorage = multer.memoryStorage();
const applyNowUpload = multer({
  storage: applyNowStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Nodemailer Setup
const applyNowTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Route to Handle Form Submission
app.post('/submit-form', applyNowUpload.single('resume'), async (req, res) => {
  try {
    const formData = new ApplyNowForm({
      ...req.body,
      resume: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      }
    });
    await formData.save();

    // Admin Notification Email
    const adminMailOptions = {
      from: process.env.MAIL_USER,
      to: 'admin@anocab.in', // Change to admin email
      subject: 'New Job Application Submitted',
      text: `
        A new application has been submitted.
        Name: ${req.body.first_name} ${req.body.last_name}
        Email: ${req.body.email}
        Phone: ${req.body.phone_no}
        Position Applied: ${req.body.position_applied}
      `,
      attachments: [
        {
          filename: `resume-${req.body.first_name || 'applicant'}.pdf`,
          content: req.file.buffer,
          contentType: req.file.mimetype
        }
      ]
    };

    // Acknowledgment Email for Applicant
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: 'Application Received',
      text: `Dear ${req.body.first_name},\n\nThank you for applying for the ${req.body.position_applied} position. We have received your application and will review it soon.\n\nBest Regards,\nHR Team`,
    };

    // Send Emails
    await applyNowTransporter.sendMail(adminMailOptions);
    await applyNowTransporter.sendMail(userMailOptions);

    res.status(200).send('Form submitted successfully!');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to Fetch All Form Submissions (Admin)
app.get('/fetch-forms', async (req, res) => {
  try {
    const forms = await ApplyNowForm.find({}, '_id first_name last_name email phone_no position_applied qualification experience cover_letter');
    res.json(forms);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to Download Resume
app.get('/download-resume/:id', async (req, res) => {
  try {
    const form = await ApplyNowForm.findById(req.params.id);
    if (!form || !form.resume) {
      return res.status(404).send('Resume not found');
    }
    res.set({
      'Content-Type': form.resume.contentType,
      'Content-Disposition': `attachment; filename="resume-${form._id}.pdf"`
    });
    res.send(form.resume.data);
  } catch (err) {
    res.status(500).send('Error downloading resume');
  }
});
// --- End Apply Now Logic ---

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

// --- Price Marquee History ---
const PRICES_HISTORY_FILE = path.join(__dirname, 'prices_history.json');

// Initialize prices_history.json if it doesn't exist
if (!fs.existsSync(PRICES_HISTORY_FILE)) {
  fs.writeFileSync(PRICES_HISTORY_FILE, JSON.stringify([], null, 2));
}

// API to get all price marquee history (for price_marqueedata.html)
app.get('/api/prices/history', (req, res) => {
  fs.readFile(PRICES_HISTORY_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading prices history:', err);
      return res.status(500).json({ error: 'Error reading prices history' });
    }
    res.json(JSON.parse(data));
  });
});

// Handle form submission from admin
app.post('/update-prices', express.json(), (req, res) => {
  const newPrices = {
    aluminum_ec: parseFloat(req.body.price_aluminum_ec),
    aluminum_alloy: parseFloat(req.body.price_aluminum_alloy),
    copper: parseFloat(req.body.price_copper),
    pvc: parseFloat(req.body.price_pvc),
    lldpe: parseFloat(req.body.price_lldpe)
  };

  // Save to prices.json
  fs.writeFile(PRICES_FILE, JSON.stringify(newPrices, null, 2), (err) => {
    if (err) {
      console.error('Error saving prices:', err);
      return res.status(500).send('Error saving prices');
    }
    // Also append to prices_history.json
    fs.readFile(PRICES_HISTORY_FILE, 'utf8', (err, data) => {
      let history = [];
      if (!err && data) {
        try { history = JSON.parse(data); } catch { history = []; }
      }
      const now = new Date();
      history.unshift({
        ...newPrices,
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5)
      });
      fs.writeFile(PRICES_HISTORY_FILE, JSON.stringify(history, null, 2), () => {});
    });
    res.redirect('/admin_panel/price_marquee.html');
  });
});
// --- End Price Marquee Logic ---


const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Enquiry Schema and Model
const enquirySchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  product: String,
  otherProduct: String,
  quantity: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model("Enquiry", enquirySchema);

// POST /api/enquiry - Save new enquiry
app.post("/api/enquiry", async (req, res) => {
  try {
    const {
      name, company, email, phone, address, product, otherProduct, quantity, message
    } = req.body;
    const enquiry = new Enquiry({
      name, company, email, phone, address, product, otherProduct, quantity, message
    });
    await enquiry.save();
    res.status(201).json({ success: true, message: "Enquiry submitted." });
  } catch (err) {
    console.error("Enquiry POST error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET /api/enquiry - Get all enquiries, optionally filter by date
app.get("/api/enquiry", async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error("Enquiry GET error:", err);
    res.status(500).json([]);
  }
});

// Schemas
const pendingPriceSchema = new mongoose.Schema({
  item: { type: String, unique: true, required: true },
  basePrice: Number,
  gst: Number,
  mrp: Number,
  batchId: String,
});
const PendingPrice = mongoose.model("PendingPrice", pendingPriceSchema);

const approvedPriceSchema = new mongoose.Schema({
  item: { type: String, required: true },
  basePrice: Number,
  gst: Number,
  mrp: Number,
  approvedAt: { type: Date, default: Date.now }
});
const ApprovedPrice = mongoose.model("ApprovedPrice", approvedPriceSchema);

const rejectedPriceSchema = new mongoose.Schema({
  item: { type: String, required: true },
  basePrice: Number,
  gst: Number,
  mrp: Number,
  rejectedAt: { type: Date, default: Date.now }
});
const RejectedPrice = mongoose.model("RejectedPrice", rejectedPriceSchema);

const mrpSchema = new mongoose.Schema({
  productName: String,
  size: String,
  aluRate: Number,
  xlpeRate: Number,
  basicPrice: String,
  finalMRP: String,
  MRP: String
});
const MrpData = mongoose.model("MrpData", mrpSchema);

// Routes
app.post("/api/prices/bulk", async (req, res) => {
  try {
    const { prices } = req.body;
    if (!prices?.length) return res.status(400).json({ error: "No prices submitted" });

    const batchId = new mongoose.Types.ObjectId().toString();
    const bulkOps = prices.map(p => ({
      updateOne: {
        filter: { item: p.item },
        update: { ...p, batchId },
        upsert: true
      }
    }));
    await PendingPrice.bulkWrite(bulkOps);
    res.status(200).json({ message: "Prices submitted for approval." });
  } catch (err) {
    console.error("❌ Bulk submission failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// MRP Related Routes
app.post("/api/mrp/update", async (req, res) => {
  try {
    const { productName, size, aluRate, xlpeRate, basicPrice, finalMRP } = req.body;
    
    await MrpData.findOneAndUpdate(
      { productName, size },
      { 
        productName,
        size,
        aluRate,
        xlpeRate,
        basicPrice,
        finalMRP
      },
      { upsert: true, new: true }
    );
    
    res.status(200).send('MRP updated successfully');
  } catch (err) {
    console.error("MRP update error:", err);
    res.status(500).send('Server error');
  }
});

app.get("/api/mrp/latest", async (req, res) => {
  try {
    const productName = req.query.productName;
    const query = productName ? { productName } : {};
    
    const result = await MrpData.find(query);
    res.send(result);
  } catch (err) {
    console.error("Error fetching MRP:", err);
    res.status(500).send([]);
  }
});

// Approval/Rejection Routes
app.get("/api/prices/pending", async (req, res) => {
  try {
    const data = await PendingPrice.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending prices" });
  }
});

app.post("/api/prices/approve-selected", async (req, res) => {
  try {
    const { selectedIds } = req.body;
    if (!selectedIds?.length) return res.status(400).json({ error: "No items selected" });

    const validIds = selectedIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length) return res.status(400).json({ error: "No valid IDs provided" });

    const selectedItems = await PendingPrice.find({ _id: { $in: validIds } });

    await ApprovedPrice.deleteMany({
      item: { $in: selectedItems.map(i => i.item) }
    });

    const approvedData = selectedItems.map(p => ({
      item: p.item,
      basePrice: p.basePrice,
      gst: p.gst,
      mrp: p.mrp,
      approvedAt: new Date()
    }));

    await ApprovedPrice.insertMany(approvedData);
    await PendingPrice.deleteMany({ _id: { $in: validIds } });

    res.json({ message: "Prices approved with correct MRP values" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/prices/approved", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    const total = await ApprovedPrice.countDocuments({});
    const data = await ApprovedPrice.find({})
      .sort({ approvedAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved prices" });
  }
});

app.post("/api/prices/reject-selected", async (req, res) => {
  try {
    const { selectedIds } = req.body;
    if (!selectedIds?.length) return res.status(400).json({ error: "No items selected" });

    const validIds = selectedIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length) return res.status(400).json({ error: "No valid IDs provided" });

    const itemsToReject = await PendingPrice.find({ _id: { $in: validIds } });
    const rejectedData = itemsToReject.map(p => ({
      item: p.item,
      basePrice: p.basePrice,
      gst: p.gst,
      mrp: p.mrp
    }));
    
    await RejectedPrice.insertMany(rejectedData);
    await PendingPrice.deleteMany({ _id: { $in: validIds } });

    res.json({ message: "Selected prices rejected successfully." });
  } catch (err) {
    data.area = parseFloat(data.area);
    console.error("Server error during rejection:", err);
    res.status(500).json({ error: "Server error during rejection" });
  }
});

app.get("/api/prices/rejected", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    const total = await RejectedPrice.countDocuments({});
    const data = await RejectedPrice.find({})
      .sort({ rejectedAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rejected prices" });
  }
});

app.get("/api/prices/item/:itemName", async (req, res) => {
  try {
    const itemName = req.params.itemName;
    const result = await ApprovedPrice.findOne({ item: itemName });
    if (!result) return res.status(404).json({ error: "Item not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});