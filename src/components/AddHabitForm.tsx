import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/types/supabase';

type Category = Database['public']['Tables']['habit_categories']['Row'];
type Habit = Database['public']['Tables']['habit']['Row'] & {
  category: Category | null;
};

interface HabitFormData {
  name: string;
  description: string;
  target: number;
  uom: string;
  category_id: number | null;
}

interface AddHabitFormProps {
  onClose: () => void;
  editingHabit?: Habit | null;
}

export default function AddHabitForm({ onClose, editingHabit }: AddHabitFormProps) {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<HabitFormData>({
    name: editingHabit?.name || '',
    description: editingHabit?.description || '',
    target: editingHabit?.target || 1,
    uom: editingHabit?.uom || 'times',
    category_id: editingHabit?.category_id || null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      
      // If no category is selected and we have categories, select the first one
      if (!formData.category_id && data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const mutation = useMutation({
    mutationFn: (data: HabitFormData) =>
      fetch(editingHabit ? `/api/habits/${editingHabit.id}` : '/api/habits', {
        method: editingHabit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          frequency: 'daily', // Always set to daily
        }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Description (optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Daily Target</span>
          </label>
          <input
            type="number"
            min="1"
            className="input input-bordered w-full"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Unit of Measurement</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={formData.uom}
            onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
            placeholder="times"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">
          <span className="label-text">Category (optional)</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={formData.category_id || ''}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {editingHabit ? 'Save Changes' : 'Add Habit'}
        </button>
      </div>
    </form>
  );
} 