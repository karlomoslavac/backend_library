const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const textRoutes = require('./routes/textRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true,
}));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Greška prilikom spajanja na MongoDB:'));
db.once('open', () => {
  console.log('Spajanje na MongoDB uspješno.');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Tesseract worker
const worker = createWorker();

// OCR endpoint
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  const imagePath = path.join(__dirname, 'uploads', req.file.filename);
  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    fs.unlinkSync(imagePath); // Delete image after OCR
    res.status(200).json({ text });
  } catch (error) {
    console.error('Greška prilikom OCR procesa:', error);
    res.status(500).json({ message: 'Greška prilikom OCR procesa', error });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/texts', textRoutes);

// Server listen
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
