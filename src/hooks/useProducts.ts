import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_type: 'quality' | 'quantity';
  pack_size: string;
  price: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pack_size: string;
  category_id: string | null;
  image_url: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  upi_id: string | null;
  whatsapp_number: string | null;
  updated_at: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;

      // Fetch variants for all products
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .order('is_default', { ascending: false });
      if (variantsError) throw variantsError;

      // Attach variants to products
      const productsWithVariants = (products as Product[]).map(product => ({
        ...product,
        variants: (variants as ProductVariant[]).filter(v => v.product_id === product.id),
      }));

      return productsWithVariants;
    },
  });
}

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: ['product_variants', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

export function useAddProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert(variant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product_variants'] });
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product_variants'] });
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product_variants'] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as SiteSettings;
    },
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings> & { id: string }) => {
      const { id, ...updates } = settings;
      const { data, error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });
}

// Helper functions
export function generateWhatsAppLink(
  message: string,
  whatsappNumber: string
): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
}

export function generateUPILink(
  amount: number,
  upiId: string,
  productName: string
): string {
  const note = encodeURIComponent(`NilgirisFresh - ${productName}`);
  return `upi://pay?pa=${upiId}&pn=NilgirisFresh&am=${amount}&cu=INR&tn=${note}`;
}
