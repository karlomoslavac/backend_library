const express = require('express');
const router = express.Router();
const textController = require('../controllers/textController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Routes
router.post('/', upload.single('image'), textController.addText);
router.delete('/:id', textController.deleteText);
router.post('/:id/ocr', textController.runOCR);

module.exports = router;
