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
  const categoryId = parseInt(id as string);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const { name, color, icon } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const { data, error } = await supabase
          .from('habit_categories')
          .update({
            name,
            color,
            icon,
            updated_at: new Date().toISOString(),
          })
          .eq('id', categoryId)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({ error: 'Failed to update category' });
      }

    case 'DELETE':
      try {
        // First, update any habits that use this category to have no category
        const { error: updateError } = await supabase
          .from('habit')
          .update({ category_id: null })
          .eq('category_id', categoryId);

        if (updateError) throw updateError;

        // Then delete the category
        const { error: deleteError } = await supabase
          .from('habit_categories')
          .delete()
          .eq('id', categoryId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ message: 'Category deleted successfully' });
      } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ error: 'Failed to delete category' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 