const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/csv',
    'application/json'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    Logger.warn('File upload rejected - invalid type', {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    cb(new Error('Invalid file type. Only text, PDF, Word, and JSON files are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Single file upload
  }
});

// Create middleware functions
const transcriptUpload = upload.single('transcript');
const multipleUpload = upload.array('files', 5);

// Safe middleware wrapper to handle multer errors
const createUploadMiddleware = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                status: 'error',
                message: 'File too large. Maximum size is 10MB.'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                status: 'error',
                message: 'Too many files. Maximum is 5 files.'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                status: 'error',
                message: 'Unexpected file field.'
              });
            default:
              return res.status(400).json({
                status: 'error',
                message: `File upload error: ${err.message}`
              });
          }
        } else if (err) {
          return res.status(400).json({
            status: 'error',
            message: err.message
          });
        }
      }
      next();
    });
  };
};

// Export safe middleware functions
module.exports = {
  single: createUploadMiddleware(transcriptUpload),
  multiple: createUploadMiddleware(multipleUpload),
  
  // Direct multer instance for advanced usage
  upload: upload,
  
  // Cleanup middleware
  cleanupOnError: (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 400 && req.file) {
        try {
          fs.unlinkSync(req.file.path);
          Logger.info('Cleaned up uploaded file due to error', {
            filename: req.file.filename
          });
        } catch (cleanupError) {
          Logger.error('Error cleaning up uploaded file', cleanupError);
        }
      }
      originalSend.call(this, data);
    };
    next();
  }
};
