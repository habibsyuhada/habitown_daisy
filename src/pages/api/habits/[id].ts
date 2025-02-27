import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const habitId = parseInt(id as string);

  if (isNaN(habitId)) {
    return res.status(400).json({ error: 'Invalid habit ID' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { name, description, frequency, target, category_id, uom } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const { data, error } = await supabase
          .from('habit')
          .update({
            name,
            description,
            frequency,
            target,
            uom,
            category_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', habitId)
          .select(`
            *,
            category:habit_categories(*)
          `)
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        console.error('Error updating habit:', error);
        return res.status(500).json({ error: 'Failed to update habit' });
      }

    case 'DELETE':
      try {
        // First delete all habit records
        const { error: recordsError } = await supabase
          .from('habit_records')
          .delete()
          .eq('habit_id', habitId);

        if (recordsError) throw recordsError;

        // Then delete the habit
        const { error: habitError } = await supabase
          .from('habit')
          .delete()
          .eq('id', habitId);

        if (habitError) throw habitError;
        return res.status(200).json({ message: 'Habit deleted successfully' });
      } catch (error) {
        console.error('Error deleting habit:', error);
        return res.status(500).json({ error: 'Failed to delete habit' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 