import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  useProducts
} from '@/hooks/useProducts';
import type { Category } from '@/hooks/useProducts';

export default function AdminCategories() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategoryMutation.mutate(
        { id: editingCategory.id, ...formData },
        {
          onSuccess: () => {
            toast({ title: 'Category updated successfully!' });
            setIsDialogOpen(false);
            resetForm();
          },
          onError: () => {
            toast({ title: 'Failed to update category', variant: 'destructive' });
          }
        }
      );
    } else {
      addCategoryMutation.mutate(
        formData,
        {
          onSuccess: () => {
            toast({ title: 'Category added successfully!' });
            setIsDialogOpen(false);
            resetForm();
          },
          onError: () => {
            toast({ title: 'Failed to add category', variant: 'destructive' });
          }
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    const productsInCategory = products.filter(p => p.category_id === id);
    if (productsInCategory.length > 0) {
      toast({
        title: 'Cannot delete category',
        description: `This category has ${productsInCategory.length} product(s). Remove or reassign them first.`,
        variant: 'destructive',
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: 'Category deleted successfully!' });
        },
        onError: () => {
          toast({ title: 'Failed to delete category', variant: 'destructive' });
        }
      });
    }
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId).length;
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Organize your products into categories
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif font-semibold text-lg text-foreground">
                {category.name}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(category.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {category.description || 'No description'}
            </p>
            <p className="text-xs text-muted-foreground">
              {getProductCount(category.id)} product(s)
            </p>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
          No categories yet. Add your first category!
        </div>
      )}
    </AdminLayout>
  );
}
