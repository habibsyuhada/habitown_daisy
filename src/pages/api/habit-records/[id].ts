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
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Record ID is required' });
  }

  // First verify that the record exists and belongs to a habit owned by the user
  const { data: record, error: recordError } = await supabase
    .from('habit_records')
    .select(`
      *,
      habit:habit_id (
        user_id
      )
    `)
    .eq('id', id)
    .single();

  if (recordError || !record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  if (record.habit.user_id !== user.id) {
    return res.status(403).json({ error: 'Not authorized to modify this record' });
  }

  if (req.method === 'DELETE') {
    try {
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

  if (req.method === 'PUT') {
    const { value, notes } = req.body;

    try {
      const { data: updatedRecord, error } = await supabase
        .from('habit_records')
        .update({
          value,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(updatedRecord);
    } catch (error) {
      console.error('Failed to update habit record:', error);
      return res.status(500).json({ error: 'Failed to update habit record' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 