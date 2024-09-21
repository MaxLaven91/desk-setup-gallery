import { IncomingForm } from 'formidable';
import { put } from '@vercel/blob';
import prisma from '../../lib/prisma';

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
      let imageUrl = '';
      if (files.image) {
        const file = files.image[0];
        const { url } = await put(file.originalFilename, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        imageUrl = url;
      }

      const submission = await prisma.setupSubmission.create({
        data: {
          name: fields.name[0],
          email: fields.email[0],
          setupDescription: fields.setupDescription[0],
          socialLink: fields.socialLink[0],
          imageUrl: imageUrl,
          status: 'pending',
        },
      });

      res.status(201).json({ message: 'Setup submitted successfully', id: submission.id });
    } catch (error) {
      console.error('Error submitting setup:', error);
      res.status(500).json({ error: 'An error occurred while submitting the setup' });
    }
  });
}