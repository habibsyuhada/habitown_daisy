import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const habits = await prisma.habit.findMany({
        where: {
          userId: session.user.id,
          archived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json(habits);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }
  }

  if (req.method === 'POST') {
    const { name, description, frequency, target, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const habit = await prisma.habit.create({
        data: {
          name,
          description,
          frequency,
          target,
          category,
          userId: session.user.id,
        },
      });
      return res.status(201).json(habit);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create habit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 