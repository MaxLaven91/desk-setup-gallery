// pages/api/user-votes.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '';

  try {
    let userVote = await prisma.userVote.findUnique({
      where: { ip },
    });

    if (!userVote) {
      // Create a new UserVote record for this IP
      userVote = await prisma.userVote.create({
        data: { ip },
      });
    }

    // Get the list of image IDs the user has voted for
    const votes = await prisma.vote.findMany({
      where: { ip },
      select: { imageId: true },
    });

    const votedImageIds = votes.map((vote) => vote.imageId);

    res.status(200).json({
      votesLeft: userVote.votesLeft,
      votedImageIds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}