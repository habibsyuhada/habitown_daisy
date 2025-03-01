import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/router';
import { Plus, Loader2, Edit2, Trash2, Smile, Castle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

type Category = Database['public']['Tables']['habit_categories']['Row'];

interface EditingCategory extends Category {
  isEditing?: boolean;
}

export default function Sidebar() {
  const [categories, setCategories] = useState<EditingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#4F46E5', icon: '📋' });
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<'new' | 'edit' | null>(null);
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
      router.push('/');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  return (
    <>
      <div className="w-64 bg-gradient-to-b from-base-100 to-base-200 min-h-screen p-6 shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold text-base-content">Categories</h2>
          <motion.button
            className="btn btn-circle btn-sm btn-primary btn-outline"
            onClick={() => setShowAddForm(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={18} />
          </motion.button>
        </div>

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
                    <div className="relative">
                      <button
                        type="button"
                        className="btn btn-outline w-full"
                        onClick={() => setActiveEmojiPicker('new')}
                      >
                        {newCategory.icon} <Smile size={16} />
                      </button>
                      {activeEmojiPicker === 'new' && (
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                          <div className="relative">
                            <button 
                              className="fixed inset-0 bg-transparent"
                              onClick={() => setActiveEmojiPicker(null)}
                            />
                            <div className="bg-base-100 rounded-lg shadow-xl">
                              <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                width={350}
                                height={450}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Color</span>
                    </label>
                    <input
                      type="color"
                      className="input input-bordered w-full h-12"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    />
                  </div>
                </div>

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

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            <motion.button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                !categoryId 
                  ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' 
                  : 'text-base-content/70 hover:bg-base-200/50'
              }`}
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                !categoryId ? 'bg-primary-content/20' : 'bg-primary/10'
              }`}>
                <Castle size={20} className={!categoryId ? 'text-primary-content' : 'text-primary'} />
              </span>
              <span className="flex-1 text-base font-medium text-left">All Habits</span>
              <ChevronRight size={18} className={!categoryId ? 'text-primary-content/70' : 'text-base-content/30'} />
            </motion.button>

            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="group relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <motion.button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    categoryId === category.id.toString()
                      ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                      : 'text-base-content/70 hover:bg-base-200/50'
                  }`}
                  onClick={() => router.push(`/?categoryId=${category.id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      categoryId === category.id.toString() 
                        ? 'bg-primary-content/20' 
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: categoryId === category.id.toString() 
                        ? undefined 
                        : `${category.color}15` || '#4F46E515',
                      color: categoryId === category.id.toString() 
                        ? 'inherit'
                        : category.color || '#4F46E5'
                    }}
                  >
                    <span className="text-xl">{category.icon}</span>
                  </span>
                  <span className="flex-1 text-base font-medium text-left">{category.name}</span>
                  <ChevronRight 
                    size={18} 
                    className={categoryId === category.id.toString() 
                      ? 'text-primary-content/70' 
                      : 'text-base-content/30'
                    } 
                  />
                </motion.button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                  <motion.button
                    className="btn btn-circle btn-ghost btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 size={14} />
                  </motion.button>
                  <motion.button
                    className="btn btn-circle btn-ghost btn-xs text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
                  <div className="relative">
                    <button
                      type="button"
                      className="btn btn-outline w-full"
                      onClick={() => setActiveEmojiPicker('edit')}
                    >
                      {editingCategory.icon || '📋'} <Smile size={16} />
                    </button>
                    {activeEmojiPicker === 'edit' && (
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                        <div className="relative">
                          <button 
                            className="fixed inset-0 bg-transparent"
                            onClick={() => setActiveEmojiPicker(null)}
                          />
                          <div className="bg-base-100 rounded-lg shadow-xl">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              width={350}
                              height={450}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Color</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered w-full h-12"
                    value={editingCategory.color || '#4F46E5'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  className="btn btn-ghost"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button
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
    </>
  );
} 