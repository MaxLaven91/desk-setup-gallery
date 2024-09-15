// pages/api/vote.js
import rateLimit from 'express-rate-limit';
import prisma from '../../lib/prisma';

const MAX_VOTES = 25; // Set the maximum number of votes

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, limiter);

  if (req.method !== 'POST') {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    return;
  }

  const { imageId } = req.body;
  const ip =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '';

  try {
    // Check if the image exists
    const image = await prisma.image.findUnique({
      where: { id: Number(imageId) },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if the user has votes left
    let userVote = await prisma.userVote.findUnique({
      where: { ip },
    });

    if (!userVote) {
      // Create a new UserVote record for this IP
      userVote = await prisma.userVote.create({
        data: { ip },
      });
    }

    // Check if this IP has already voted for this image
    const existingVote = await prisma.vote.findFirst({
      where: {
        imageId: Number(imageId),
        ip: ip,
      },
    });

    if (existingVote) {
      // User has already voted; remove the vote

      // Delete the vote record
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      // Increment the user's votesLeft, but do not exceed MAX_VOTES
      if (userVote.votesLeft < MAX_VOTES) {
        userVote = await prisma.userVote.update({
          where: { ip },
          data: {
            votesLeft: { increment: 1 },
          },
        });
      }

      // Decrement the vote count on the image
      const updatedImage = await prisma.image.update({
        where: { id: Number(imageId) },
        data: {
          votes: { decrement: 1 },
        },
      });

      res.status(200).json({
        message: 'Vote removed',
        votes: updatedImage.votes,
        votesLeft: userVote.votesLeft,
        hasVoted: false,
      });
    } else {
      // User has not voted yet; add the vote

      if (userVote.votesLeft <= 0) {
        return res.status(400).json({ error: 'You have no votes left' });
      }

      // Create a new vote
      await prisma.vote.create({
        data: {
          imageId: Number(imageId),
          ip: ip,
        },
      });

      // Decrement the user's votesLeft
      userVote = await prisma.userVote.update({
        where: { ip },
        data: {
          votesLeft: { decrement: 1 },
        },
      });

      // Increment the vote count on the image
      const updatedImage = await prisma.image.update({
        where: { id: Number(imageId) },
        data: {
          votes: { increment: 1 },
        },
      });

      res.status(200).json({
        message: 'Vote counted',
        votes: updatedImage.votes,
        votesLeft: userVote.votesLeft,
        hasVoted: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}