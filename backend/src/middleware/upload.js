const multer = require('multer');

// Allowed MIME types
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Allowed extensions
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File filter to only allow supported image formats
 */
const fileFilter = (req, file, cb) => {
  if (
    ALLOWED_MIMETYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.'),
      false
    );
  }
};

/**
 * Multer upload configured with memory storage (no disk writes)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

module.exports = upload;
