import type { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase';

// Define a type for the habit record
interface HabitRecord {
  id: number;
  habit_id: number;
  date: string | Date;
  value: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const supabase = createAdminClient();
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get habit records
      const { data: records, error } = await supabase
        .from('habit_records')
        .select('*')
        .eq('habit_id', Number(id))
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (!records) {
        return res.status(404).json({ error: 'No records found' });
      }

      // Calculate statistics
      const weeklyStats = records.filter((record: HabitRecord) => 
        new Date(record.date) >= startOfWeek
      ).length;

      const monthlyStats = records.filter((record: HabitRecord) => 
        new Date(record.date) >= startOfMonth
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
      console.error('Error fetching habit statistics:', error);
      res.status(500).json({ error: 'Failed to fetch habit statistics' });
    }
  }
} 