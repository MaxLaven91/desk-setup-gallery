import cloudinary from 'cloudinary';
import multer from 'multer';
import { promisify } from 'util';

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Promisify Cloudinary upload
const cloudinaryUpload = promisify(cloudinary.v2.uploader.upload);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Handle file upload with Multer
    await runMiddleware(req, res, upload.single('image'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinaryUpload(req.file.buffer, {
      resource_type: 'image'
    });

    // Return the Cloudinary URL
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}