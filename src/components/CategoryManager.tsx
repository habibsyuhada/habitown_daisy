import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

interface EditingCategory extends Category {
  isEditing?: boolean;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<EditingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#4F46E5', icon: '📋' });
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<'new' | 'edit' | null>(null);

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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (activeEmojiPicker === 'new') {
      setNewCategory(prev => ({ ...prev, icon: emojiData.emoji }));
    } else if (activeEmojiPicker === 'edit' && editingCategory) {
      setEditingCategory({ ...editingCategory, icon: emojiData.emoji });
    }
    setActiveEmojiPicker(null);
  };

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

  async function handleUpdateCategory(category: EditingCategory) {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          color: category.color,
          icon: category.icon,
        }),
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!confirm('Are you sure you want to delete this category? All associated habits will be moved to uncategorized.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Category Management
        </h2>
        <motion.button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          Add Category
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-base-100/50 backdrop-blur-sm rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${category.color}15` || '#4F46E515',
                    color: category.color || '#4F46E5'
                  }}
                >
                  <span className="text-xl">{category.icon}</span>
                </span>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => setEditingCategory(category)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  className="btn btn-ghost btn-sm btn-square text-error"
                  onClick={() => handleDeleteCategory(category.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Category name"
                  className="input input-bordered w-full"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Icon</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={() => setActiveEmojiPicker('new')}
                  >
                    <span className="text-2xl mr-2">{newCategory.icon}</span>
                    <Smile size={18} />
                  </button>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Color</span>
                  </label>
                  <input
                    type="color"
                    className="w-full h-12 rounded-lg cursor-pointer"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
              </div>

              {activeEmojiPicker === 'new' && (
                <div className="mt-4">
                  <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Edit Category
            </h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Category name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Icon</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={() => setActiveEmojiPicker('edit')}
                  >
                    <span className="text-2xl mr-2">{editingCategory.icon}</span>
                    <Smile size={18} />
                  </button>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Color</span>
                  </label>
                  <input
                    type="color"
                    className="w-full h-12 rounded-lg cursor-pointer"
                    value={editingCategory.color || '#4F46E5'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                  />
                </div>
              </div>

              {activeEmojiPicker === 'edit' && (
                <div className="mt-4">
                  <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleUpdateCategory(editingCategory)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 