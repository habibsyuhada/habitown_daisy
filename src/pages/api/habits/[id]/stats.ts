import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get habit records
      const records = await prisma.habitRecord.findMany({
        where: {
          habitId: Number(id),
          completed: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      // Calculate statistics
      const weeklyStats = records.filter(record => 
        record.date >= startOfWeek
      ).length;

      const monthlyStats = records.filter(record => 
        record.date >= startOfMonth
      ).length;

      // Calculate current streak
      let currentStreak = 0;
      let i = 0;
      const today = new Date();
      while (i < records.length) {
        const recordDate = new Date(records[i].date);
        if (
          recordDate.getDate() === today.getDate() - i &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        ) {
          currentStreak++;
        } else {
          break;
        }
        i++;
      }

      res.status(200).json({
        weeklyCompletion: weeklyStats,
        monthlyCompletion: monthlyStats,
        currentStreak,
        totalCompletions: records.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch habit statistics' });
    }
  }
} 