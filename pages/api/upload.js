// pages/api/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single('image'));

    if (req.method !== 'POST') {
      res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
      return;
    }

    const { instagramHandle } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Read existing data
    const filePath = path.join(process.cwd(), 'data', 'images.json');
    const fileData = fs.existsSync(filePath)
      ? fs.readFileSync(filePath)
      : '[]';
    const images = JSON.parse(fileData);

    // Add new image data
    images.push({ imageUrl, instagramHandle, votes: 0 });

    // Save back to the file
    fs.writeFileSync(filePath, JSON.stringify(images, null, 2));

    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: `Sorry something went wrong! ${error.message}` });
  }
}