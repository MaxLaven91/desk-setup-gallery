// pages/api/upload.js
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import prisma from '../../lib/prisma';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure Multer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File is not an image'));
    } else {
      cb(null, true);
    }
  },
});

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, limiter);

  if (req.method !== 'POST') {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    return;
  }

  try {
    await runMiddleware(req, res, upload.single('image'));

    const { instagramHandle } = req.body;
    const imageBuffer = req.file.buffer;

    // Validate and process the image using sharp
    const processedImage = await sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside' })
      .toFormat('jpeg')
      .toBuffer();

    // Generate a unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Ensure the uploads directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'public', 'uploads'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
    }

    // Save the image to the uploads directory
    fs.writeFileSync(imagePath, processedImage);

    const imageUrl = `/uploads/${filename}`;

    // Save image data to the database
    const newImage = await prisma.image.create({
      data: {
        imageUrl,
        instagramHandle: instagramHandle || null,
      },
    });

    res.status(200).json({ message: 'Success', image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Sorry, something went wrong! ${error.message}` });
  }
}