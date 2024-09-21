import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    const images = await prisma.image.findMany({
      orderBy: { votes: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        instagramHandle: true,
        votes: true,
      },
    });
    console.log('Fetched images:', images); // Add this line
    res.status(200).json(images);
  } catch (error) {
    console.error('Error in /api/images:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}