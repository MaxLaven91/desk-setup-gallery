import cloudinary from 'cloudinary';
import multer from 'multer';

// Cloudinary configuration
cloudinary.config({
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Handle image upload with Cloudinary
  try {
    await runMiddleware(req, res, upload.single('image'));
    const imageBuffer = req.file.buffer;

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return res.status(500).json({ error: 'Cloudinary upload failed' });
      return res.status(200).json({ url: result.secure_url });
    }).end(imageBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}