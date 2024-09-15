// pages/api/vote.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { index } = req.body;

    const filePath = path.join(process.cwd(), 'data', 'images.json');
    const fileData = fs.existsSync(filePath)
      ? fs.readFileSync(filePath)
      : '[]';
    const images = JSON.parse(fileData);

    if (images[index]) {
      images[index].votes += 1;
      fs.writeFileSync(filePath, JSON.stringify(images, null, 2));
      res.status(200).json({ message: 'Vote counted' });
    } else {
      res.status(400).json({ error: 'Invalid image index' });
    }
  } else {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
}