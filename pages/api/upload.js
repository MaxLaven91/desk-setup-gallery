import { IncomingForm } from 'formidable';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Error processing form' });
    }

    try {
      const file = files.image[0];
      
      // Read the file into a buffer
      const fileBuffer = await readFileAsBuffer(file.filepath);

      // Upload buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileBuffer);
      });

      // Here you would typically save the image URL and social link to your database
      
      res.status(200).json({ url: result.secure_url });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading image' });
    }
  });
}

// Helper function to read file as buffer
function readFileAsBuffer(filepath) {
  const fs = require('fs').promises;
  return fs.readFile(filepath);
}