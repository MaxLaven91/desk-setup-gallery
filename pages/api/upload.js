import { IncomingForm } from 'formidable';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import prisma from '../../lib/prisma'; // Ensure this path is correct for your Prisma client

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
      const fileBuffer = await fs.readFile(file.filepath);

      console.log('Attempting to upload to Vercel Blob...');
      const { url } = await put(file.originalFilename, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      console.log('Upload successful');
      
      // Save the image URL and social link to your database
      const image = await prisma.image.create({
        data: {
          imageUrl: url,
          instagramHandle: fields.instagramHandle ? fields.instagramHandle[0] : null,
        },
      });

      res.status(200).json({ id: image.id, url: image.imageUrl, instagramHandle: image.instagramHandle });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Error uploading image', details: error.message });
    }
  });
}