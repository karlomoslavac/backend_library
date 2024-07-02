const Text = require('../models/Text.js');
const { createWorker } = require('tesseract.js');
const fs = require('fs');
const path = require('path');

let worker;

const initializeWorker = async () => {
  worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
};

initializeWorker().catch(err => {
  console.error('Greška prilikom inicijalizacije radnika:', err);
});

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
    const text = await Text.findById(textId);
    if (!text) {
      return res.status(404).json({ message: 'Tekst nije pronađen.' });
    }

    if (!worker) {
      return res.status(500).json({ message: 'Radnik za OCR nije inicijaliziran.' });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', text.image);
    const { data: { text: ocrText } } = await worker.recognize(imagePath);
    fs.unlinkSync(imagePath); // Obriši sliku nakon OCR procesa
    res.status(200).json({ text: ocrText });
  } catch (error) {
    console.error('Greška prilikom OCR procesa:', error);
    res.status(500).json({ message: 'Greška prilikom OCR procesa', error });
  }
};

module.exports = {
  addText,
  deleteText,
  runOCR,
};
