import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import productSample from '@/assets/product-sample.png';
import type { Product, ProductVariant } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Group variants by type
  const { qualityVariants, quantityVariants } = useMemo(() => {
    const variants = product.variants || [];
    return {
      qualityVariants: variants.filter(v => v.variant_type === 'quality'),
      quantityVariants: variants.filter(v => v.variant_type === 'quantity'),
    };
  }, [product.variants]);

  // Find default variant or first one
  const defaultVariant = useMemo(() => {
    const variants = product.variants || [];
    return variants.find(v => v.is_default) || variants[0] || null;
  }, [product.variants]);

  const [selectedQuality, setSelectedQuality] = useState<ProductVariant | null>(
    qualityVariants.find(v => v.is_default) || qualityVariants[0] || null
  );
  const [selectedQuantity, setSelectedQuantity] = useState<ProductVariant | null>(
    quantityVariants.find(v => v.is_default) || quantityVariants[0] || null
  );

  // Current active variant (priority: quantity > quality > default)
  const activeVariant = selectedQuantity || selectedQuality || defaultVariant;

  // Current price and pack size
  const currentPrice = activeVariant?.price ?? product.price;
  const currentPackSize = activeVariant?.pack_size ?? product.pack_size;

  const getCartItemData = () => ({
    id: product.id,
    variantId: activeVariant?.id,
    name: product.name,
    variantName: activeVariant ? `${activeVariant.variant_name} - ${activeVariant.pack_size}` : undefined,
    description: product.description || '',
    price: currentPrice,
    packSize: currentPackSize,
    image_url: product.image_url,
  });

  const handleAddToCart = () => {
    addToCart(getCartItemData(), quantity);
    
    toast({
      title: 'Added to cart!',
      description: `${quantity}x ${product.name}${activeVariant ? ` (${activeVariant.variant_name})` : ''}`,
    });
    setQuantity(1);
  };

  const handleBuyNow = () => {
    addToCart(getCartItemData(), quantity);
    navigate('/cart');
  };

  const hasVariants = qualityVariants.length > 0 || quantityVariants.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
        <img
          src={product.image_url || productSample}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {currentPackSize}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Quality Variants */}
        {qualityVariants.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground mb-1.5 block">Quality:</span>
            <div className="flex flex-wrap gap-1.5">
              {qualityVariants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedQuality(variant)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md border transition-all",
                    selectedQuality?.id === variant.id
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  )}
                >
                  {variant.variant_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity/Size Variants */}
        {quantityVariants.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground mb-1.5 block">Size:</span>
            <div className="flex flex-wrap gap-1.5">
              {quantityVariants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedQuantity(variant)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md border transition-all",
                    selectedQuantity?.id === variant.id
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50 text-muted-foreground",
                    variant.stock_status === 'out_of_stock' && "opacity-50 line-through"
                  )}
                  disabled={variant.stock_status === 'out_of_stock'}
                >
                  {variant.pack_size} - ₹{variant.price}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-primary">₹{currentPrice}</span>
          <span className="text-sm text-muted-foreground">/ {currentPackSize}</span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-muted-foreground">Qty:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={handleAddToCart}
          disabled={activeVariant?.stock_status === 'out_of_stock'}
        >
          <ShoppingCart className="w-4 h-4" />
          {activeVariant?.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        {/* Buy Now Button */}
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full mt-2"
          onClick={handleBuyNow}
          disabled={activeVariant?.stock_status === 'out_of_stock'}
        >
          <Zap className="w-4 h-4" />
          Buy Now
        </Button>
      </div>
    </motion.div>
  );
}
