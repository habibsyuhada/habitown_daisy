import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/router';
import { Plus, Loader2 } from 'lucide-react';

type Category = Database['public']['Tables']['habit_categories']['Row'];

export default function Sidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#4F46E5', icon: '📋' });
  const router = useRouter();
  const { categoryId } = router.query;

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      setNewCategory({ name: '', color: '#4F46E5', icon: '📋' });
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  return (
    <div className="w-64 bg-base-200 h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Categories</h2>
        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCategory} className="mb-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Category name"
              className="input input-bordered input-sm mb-2"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
            <div className="flex gap-2 mb-2">
              <input
                type="color"
                className="input input-bordered input-sm w-1/2"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
              <input
                type="text"
                placeholder="Icon"
                className="input input-bordered input-sm w-1/2"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Add Category</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <ul className="menu bg-base-200 rounded-box">
          <li>
            <button
              className={`flex items-center gap-2 ${!categoryId ? 'active' : ''}`}
              onClick={() => router.push('/')}
            >
              📊 All Habits
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                className={`flex items-center gap-2 ${
                  categoryId === category.id.toString() ? 'active' : ''
                }`}
                onClick={() => router.push(`/?categoryId=${category.id}`)}
                style={{
                  borderLeft: `4px solid ${category.color || '#4F46E5'}`,
                }}
              >
                {category.icon || '📋'} {category.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 