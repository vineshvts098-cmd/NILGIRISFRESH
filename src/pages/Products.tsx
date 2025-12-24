import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useCategories, useSiteSettings } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export default function Products() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSiteSettings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Our Tea Collection
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Explore our range of premium Nilgiri teas, sourced directly from Gudalur estates
            </p>
          </motion.div>
        </div>
      </section>

      {/* Payment Info Banner */}
      <section className="bg-accent/10 border-y border-accent/20 py-4">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
            <Info className="w-5 h-5 text-accent flex-shrink-0" />
            <p className="text-sm text-foreground">
              <strong>Easy Ordering:</strong> Select your product, pay via UPI to{' '}
              <span className="font-mono bg-secondary px-2 py-1 rounded">{settings?.upi_id || 'Loading...'}</span>, 
              and confirm on WhatsApp with payment screenshot.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* UPI Instructions */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-8">
              How to Order
            </h2>
            
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-elegant">
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Select Your Product</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse our collection and choose your preferred tea and pack size.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Pay via UPI</h3>
                    <p className="text-sm text-muted-foreground">
                      Click "Pay via UPI" or scan QR code. Complete payment to:{' '}
                      <span className="font-mono bg-secondary px-2 py-0.5 rounded">{settings?.upi_id || 'Loading...'}</span>
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Confirm on WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Send your order details along with payment screenshot via WhatsApp. 
                      We'll confirm and ship within 24-48 hours.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Note:</strong> Payment confirmation is manual. You'll receive 
                  order confirmation on WhatsApp within 2-4 hours during business hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
