const Text = require('../models/Text.js');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const addText = async (req, res) => {
  try {
    const newText = new Text({
      title: req.body.title,
      author: req.body.author,
      pageCount: req.body.pageCount,
      image: req.file.filename,
    });
    const savedText = await newText.save();
    res.status(201).json(savedText);
  } catch (error) {
    console.error('Greška prilikom dodavanja sadržaja:', error);
    res.status(500).json({ message: 'Greška prilikom dodavanja sadržaja', error });
  }
};

const deleteText = async (req, res) => {
  try {
    await Text.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Greška prilikom brisanja sadržaja:', error);
    res.status(500).json({ message: 'Greška prilikom brisanja sadržaja', error });
  }
};

const runOCR = async (req, res) => {
  const textId = req.params.id;
  try {
    console.log('Pokrećem OCR za tekst:', textId);
    const text = await Text.findById(textId);
    if (!text) {
      return res.status(404).json({ message: 'Tekst nije pronađen.' });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', text.image);
    if (!fs.existsSync(imagePath)) {
      console.error('Slika nije pronađena:', imagePath);
      return res.status(404).json({ message: 'Slika nije pronađena.' });
    }

    Tesseract.recognize(imagePath, 'eng')
      .then(({ data: { text: ocrText } }) => {
        console.log('OCR uspješno dovršen');
        fs.unlinkSync(imagePath); // Delete the image file after OCR processing
        res.status(200).json({ text: ocrText });
      })
      .catch(error => {
        console.error('Greška prilikom OCR procesa:', error);
        res.status(500).json({ message: 'Greška prilikom OCR procesa', error: error.message });
      });
  } catch (error) {
    console.error('Greška prilikom OCR procesa:', error);
    res.status(500).json({ message: 'Greška prilikom OCR procesa', error: error.message });
  }
};

module.exports = {
  addText,
  deleteText,
  runOCR,
};
