// pages/api/images.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'images.json');
  const fileData = fs.existsSync(filePath)
    ? fs.readFileSync(filePath)
    : '[]';
  const images = JSON.parse(fileData);

  res.status(200).json(images);
}