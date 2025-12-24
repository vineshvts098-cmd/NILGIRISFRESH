import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import productSample from '@/assets/product-sample.png';
import type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      packSize: product.pack_size,
      image_url: product.image_url,
    }, quantity);
    
    toast({
      title: 'Added to cart!',
      description: `${quantity}x ${product.name}`,
    });
    setQuantity(1);
  };

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
          {product.pack_size}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-primary">₹{product.price}</span>
          <span className="text-sm text-muted-foreground">/ {product.pack_size}</span>
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
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}