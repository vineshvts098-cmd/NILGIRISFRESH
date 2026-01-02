import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CartItem } from '@/contexts/CartContext';

interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    pack_size: string;
    image_url: string | null;
  };
  product_variants: {
    id: string;
    variant_name: string;
    pack_size: string;
    price: number;
  } | null;
}

export function useCartItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart-items', user?.id],
    queryFn: async (): Promise<CartItem[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          product_id,
          variant_id,
          quantity,
          created_at,
          updated_at,
          products (
            id,
            name,
            description,
            price,
            pack_size,
            image_url
          ),
          product_variants (
            id,
            variant_name,
            pack_size,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform DB structure to CartItem format
      return (data as unknown as CartItemDB[]).map(item => ({
        cartItemId: item.id, // Map DB Row ID
        id: item.product_id,
        variantId: item.variant_id || undefined,
        name: item.products.name,
        variantName: item.product_variants
          ? `${item.product_variants.variant_name} - ${item.product_variants.pack_size}`
          : undefined,
        description: item.products.description || '',
        price: item.product_variants?.price ?? item.products.price,
        packSize: item.product_variants?.pack_size ?? item.products.pack_size,
        image_url: item.products.image_url,
        quantity: item.quantity,
      }));
    },
    enabled: !!user,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      quantity
    }: {
      productId: string;
      variantId?: string;
      quantity: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Upsert - if exists, add to quantity
      let query = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { data: existing, error: fetchError } = await query.maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing cart item:', fetchError);
        throw fetchError;
      }

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        if (error) {
          console.error('Error upgrading cart quantity:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity,
          });
        if (error) {
          console.error('Error inserting cart item:', error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      console.error('Add to Cart Failed:', error);
    }
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      quantity
    }: {
      productId: string;
      variantId?: string;
      quantity: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      if (quantity <= 0) {
        // Delete if quantity is 0 or less
        // Delete if quantity is 0 or less
        let query = supabase
          .from('cart_items')
          .delete({ count: 'exact' })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (variantId) {
          query = query.eq('variant_id', variantId);
        } else {
          query = query.is('variant_id', null);
        }

        const { error, count } = await query;

        if (error) {
          console.error('Error deleting cart item (qty 0):', error);
          throw error;
        }
        if (count === 0) {
          console.warn('UpdateQuantity (Delete): No rows deleted. Check criteria:', { userId: user.id, productId, variantId });
        }
      } else {
        let query = supabase
          .from('cart_items')
          .update({ quantity }, { count: 'exact' })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (variantId) {
          query = query.eq('variant_id', variantId);
        } else {
          query = query.is('variant_id', null);
        }

        const { error, count } = await query;

        if (error) {
          console.error('Error updating cart quantity:', error);
          throw error;
        }
        if (count === 0) {
          console.warn('UpdateQuantity (Update): No rows updated. Check criteria:', { userId: user.id, productId, variantId });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      console.error('Update Quantity Failed:', error);
    }
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      variantId
    }: {
      productId: string;
      variantId?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      let query = supabase
        .from('cart_items')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (variantId) {
        query = query.eq('variant_id', variantId);
      } else {
        query = query.is('variant_id', null);
      }

      const { error: deleteError, count } = await query;

      if (deleteError) {
        console.error('Supabase Delete Error:', deleteError);
        throw deleteError;
      }

      if (count === 0) {
        console.warn('RemoveFromCart: No rows deleted. Check criteria:', { userId: user.id, productId, variantId });
      } else {
        console.log('RemoveFromCart: Deleted rows:', count);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    }
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });
}
