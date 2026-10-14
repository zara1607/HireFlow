const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload destination folder exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate clean safe filename with timestamp and clean name
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream', // Some browsers send docx as octet-stream
  ];

  if (allowedExtensions.includes(ext) && (allowedMimeTypes.includes(file.mimetype) || ext === '.pdf' || ext === '.doc' || ext === '.docx')) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PDF, DOC, and DOCX documents are permitted.'),
      false
    );
  }
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
});

module.exports = { uploadResume, uploadDir };
