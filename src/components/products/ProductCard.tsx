import { Product, getSettings, generateWhatsAppLink, generateUPILink } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { MessageCircle, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import productImage from '@/assets/product-sample.png';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const settings = getSettings();
  const whatsappLink = generateWhatsAppLink(product, settings);
  const upiLink = generateUPILink(product.price, settings, product.name);

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
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {product.packSize}
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
          <span className="text-sm text-muted-foreground">/ {product.packSize}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button variant="whatsapp" size="sm" className="w-full" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" />
              Order via WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={upiLink}>
              <IndianRupee className="w-4 h-4" />
              Pay via UPI
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
