const multer = require('multer');
const path = require('path');

// Set up storage for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 10, // Limit file size to 10MB
    fieldSize: 1024 * 1024 * 50 // Limit field size to 50MB (for base64 images)
  },
  fileFilter: fileFilter
});

module.exports = upload;