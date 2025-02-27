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
    const { categoryId } = req.query;

    try {
      let query = supabase
        .from('habit')
        .select(`
          *,
          category:habit_categories (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      return res.status(500).json({ error: 'Failed to fetch habits' });
    }
  }

  if (req.method === 'POST') {
    const { name, description, frequency, target, category_id, uom } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({ error: 'Name and frequency are required' });
    }

    try {
      const { data, error } = await supabase
        .from('habit')
        .insert({
          name,
          description,
          frequency,
          target: target || 1,
          uom: uom || 'times',
          category_id,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          category:habit_categories (*)
        `)
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      console.error('Failed to create habit:', error);
      return res.status(500).json({ error: 'Failed to create habit' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 