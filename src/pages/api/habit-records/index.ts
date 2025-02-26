import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { supabase } from '@/lib/supabase';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = session.user as SessionUser;

  if (req.method === 'GET') {
    const { habit_id, start_date, end_date } = req.query;

    try {
      let query = supabase
        .from('habit_records')
        .select(`
          *,
          habit:habit_id (
            id,
            name,
            target,
            frequency,
            user_id
          )
        `)
        .order('date', { ascending: false });

      if (habit_id) {
        query = query.eq('habit_id', habit_id);
      }

      if (start_date) {
        query = query.gte('date', start_date);
      }

      if (end_date) {
        query = query.lte('date', end_date);
      }

      const { data: records, error } = await query;

      if (error) throw error;

      // Filter records to only include those for habits owned by the user
      const filteredRecords = records.filter(record => record.habit.user_id === user.id);

      return res.status(200).json(filteredRecords);
    } catch (error) {
      console.error('Failed to fetch habit records:', error);
      return res.status(500).json({ error: 'Failed to fetch habit records' });
    }
  }

  if (req.method === 'POST') {
    const { habit_id, date, value, notes } = req.body;

    if (!habit_id || !date) {
      return res.status(400).json({ error: 'Habit ID and date are required' });
    }

    try {
      // Verify that the habit belongs to the user
      const { data: habit, error: habitError } = await supabase
        .from('habit')
        .select('user_id')
        .eq('id', habit_id)
        .single();

      if (habitError || !habit) {
        throw new Error('Habit not found');
      }

      if (habit.user_id !== user.id) {
        return res.status(403).json({ error: 'Not authorized to record for this habit' });
      }

      const { data: record, error } = await supabase
        .from('habit_records')
        .upsert({
          habit_id,
          date,
          value: value || 1,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(record);
    } catch (error) {
      console.error('Failed to create habit record:', error);
      return res.status(500).json({ error: 'Failed to create habit record' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    try {
      // Verify that the record belongs to a habit owned by the user
      const { data: record, error: recordError } = await supabase
        .from('habit_records')
        .select('habit_id')
        .eq('id', id)
        .single();

      if (recordError || !record) {
        throw new Error('Record not found');
      }

      const { data: habit, error: habitError } = await supabase
        .from('habit')
        .select('user_id')
        .eq('id', record.habit_id)
        .single();

      if (habitError || !habit) {
        throw new Error('Habit not found');
      }

      if (habit.user_id !== user.id) {
        return res.status(403).json({ error: 'Not authorized to delete this record' });
      }

      const { error } = await supabase
        .from('habit_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Failed to delete habit record:', error);
      return res.status(500).json({ error: 'Failed to delete habit record' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 