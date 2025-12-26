import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Image, Package } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useProducts,
  useCategories,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
  Product,
  ProductVariant,
} from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import productSample from '@/assets/product-sample.png';
import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  price: z.number()
    .positive('Price must be greater than 0')
    .max(999999, 'Price must be less than 999999'),
  pack_size: z.string()
    .min(1, 'Pack size is required')
    .max(50, 'Pack size must be less than 50 characters'),
  category_id: z.string().optional().or(z.literal('')),
  featured: z.boolean(),
});

interface VariantFormData {
  id?: string;
  variant_name: string;
  variant_type: 'quality' | 'quantity';
  pack_size: string;
  price: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_default: boolean;
}

const emptyVariant: VariantFormData = {
  variant_name: '',
  variant_type: 'quantity',
  pack_size: '',
  price: '',
  stock_status: 'in_stock',
  is_default: false,
};

export default function AdminProducts() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const addVariant = useAddProductVariant();
  const updateVariant = useUpdateProductVariant();
  const deleteVariant = useDeleteProductVariant();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariantProduct, setEditingVariantProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    pack_size: '',
    category_id: '',
    featured: false,
  });

  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [newVariant, setNewVariant] = useState<VariantFormData>(emptyVariant);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      pack_size: '',
      category_id: '',
      featured: false,
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setVariants([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      pack_size: product.pack_size,
      category_id: product.category_id || '',
      featured: product.featured || false,
    });
    setImagePreview(product.image_url);
    setIsDialogOpen(true);
  };

  const handleManageVariants = (product: Product) => {
    setEditingVariantProduct(product);
    setVariants(
      (product.variants || []).map(v => ({
        id: v.id,
        variant_name: v.variant_name,
        variant_type: v.variant_type as 'quality' | 'quantity',
        pack_size: v.pack_size,
        price: v.price.toString(),
        stock_status: v.stock_status as 'in_stock' | 'low_stock' | 'out_of_stock',
        is_default: v.is_default,
      }))
    );
    setNewVariant(emptyVariant);
    setIsVariantDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate form data
    const priceNum = parseFloat(formData.price);
    const validationResult = productSchema.safeParse({
      name: formData.name,
      description: formData.description,
      price: isNaN(priceNum) ? 0 : priceNum,
      pack_size: formData.pack_size,
      category_id: formData.category_id,
      featured: formData.featured,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({ title: 'Please fix the form errors', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      let image_url = editingProduct?.image_url || null;

      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const validatedData = validationResult.data;
      const productData = {
        name: validatedData.name,
        description: validatedData.description || '',
        price: validatedData.price,
        pack_size: validatedData.pack_size,
        category_id: validatedData.category_id || null,
        image_url,
        featured: validatedData.featured,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        toast({ title: 'Product updated successfully!' });
      } else {
        await addProduct.mutateAsync(productData);
        toast({ title: 'Product added successfully!' });
      }

      setIsDialogOpen(false);
      resetForm();
      setValidationErrors({});
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: 'Failed to save product', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddVariant = async () => {
    if (!editingVariantProduct || !newVariant.variant_name || !newVariant.pack_size || !newVariant.price) {
      toast({ title: 'Please fill all variant fields', variant: 'destructive' });
      return;
    }

    try {
      await addVariant.mutateAsync({
        product_id: editingVariantProduct.id,
        variant_name: newVariant.variant_name,
        variant_type: newVariant.variant_type,
        pack_size: newVariant.pack_size,
        price: parseFloat(newVariant.price),
        stock_status: newVariant.stock_status,
        is_default: newVariant.is_default,
      });
      toast({ title: 'Variant added!' });
      setNewVariant(emptyVariant);
      // Refresh variants list
      const updatedProduct = products?.find(p => p.id === editingVariantProduct.id);
      if (updatedProduct) {
        setEditingVariantProduct(updatedProduct);
      }
    } catch (error) {
      toast({ title: 'Failed to add variant', variant: 'destructive' });
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await deleteVariant.mutateAsync(variantId);
      toast({ title: 'Variant deleted!' });
    } catch (error) {
      toast({ title: 'Failed to delete variant', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
        toast({ title: 'Product deleted successfully!' });
      } catch (error) {
        toast({ title: 'Failed to delete product', variant: 'destructive' });
      }
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <AdminLayout title="Products">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          Manage your product catalog
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Product Image</Label>
                <div 
                  className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                  ) : (
                    <div className="py-4">
                      <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={200}
                  className={validationErrors.name ? 'border-destructive' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  maxLength={2000}
                  className={validationErrors.description ? 'border-destructive' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Base Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min={0.01}
                    max={999999}
                    step={0.01}
                    className={validationErrors.price ? 'border-destructive' : ''}
                  />
                  {validationErrors.price && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.price}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pack_size">Base Pack Size *</Label>
                  <Input
                    id="pack_size"
                    value={formData.pack_size}
                    onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                    placeholder="e.g., 250g"
                    required
                    maxLength={50}
                    className={validationErrors.pack_size ? 'border-destructive' : ''}
                  />
                  {validationErrors.pack_size && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.pack_size}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isUploading}>
                  {isUploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variant Management Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Variants - {editingVariantProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Existing Variants */}
          <div className="space-y-3">
            <Label>Current Variants</Label>
            {editingVariantProduct?.variants?.length === 0 && (
              <p className="text-sm text-muted-foreground">No variants yet. Add quality or size options below.</p>
            )}
            {editingVariantProduct?.variants?.map(variant => (
              <div key={variant.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span> {variant.variant_name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span> {variant.variant_type}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span> {variant.pack_size}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span> ₹{variant.price}
                  </div>
                </div>
                {variant.is_default && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">Default</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteVariant(variant.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Variant */}
          <div className="border-t pt-4 mt-4">
            <Label className="mb-3 block">Add New Variant</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Variant Name *</Label>
                <Input
                  placeholder="e.g., Premium, Standard"
                  value={newVariant.variant_name}
                  onChange={(e) => setNewVariant({ ...newVariant, variant_name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={newVariant.variant_type}
                  onValueChange={(value: 'quality' | 'quantity') => setNewVariant({ ...newVariant, variant_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="quantity">Size/Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Pack Size *</Label>
                <Input
                  placeholder="e.g., 100g, 500g"
                  value={newVariant.pack_size}
                  onChange={(e) => setNewVariant({ ...newVariant, pack_size: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Price (₹) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 299"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Stock Status</Label>
                <Select
                  value={newVariant.stock_status}
                  onValueChange={(value: 'in_stock' | 'low_stock' | 'out_of_stock') => setNewVariant({ ...newVariant, stock_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newVariant.is_default}
                    onCheckedChange={(checked) => setNewVariant({ ...newVariant, is_default: checked })}
                  />
                  <Label className="text-xs">Default</Label>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={handleAddVariant}>
              <Plus className="w-4 h-4" />
              Add Variant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products - Mobile Cards / Desktop Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        {productsLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden divide-y divide-border">
              {products?.map((product) => (
                <div key={product.id} className="p-4 flex gap-4">
                  <img
                    src={product.image_url || productSample}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-semibold text-primary">₹{product.price}</span>
                          <span className="text-xs text-muted-foreground">{product.pack_size}</span>
                          {product.variants && product.variants.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              {product.variants.length} variants
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleManageVariants(product)}
                          title="Manage Variants"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-4 font-medium text-foreground">Product</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Category</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Base Price</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Variants</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Featured</th>
                    <th className="text-right py-4 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || productSample}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.pack_size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {getCategoryName(product.category_id)}
                      </td>
                      <td className="py-4 px-4 text-foreground font-medium">
                        ₹{product.price}
                      </td>
                      <td className="py-4 px-4">
                        {product.variants && product.variants.length > 0 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {product.variants.length} variants
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.featured ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {product.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManageVariants(product)}
                            title="Manage Variants"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {products?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No products yet. Add your first product!
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
