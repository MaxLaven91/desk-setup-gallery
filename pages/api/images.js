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
    res.status(200).json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    await prisma.$disconnect();
  }
}