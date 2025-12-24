import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useCategories, useSiteSettings } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Flame } from 'lucide-react';

export default function Products() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSiteSettings();
  const [selectedTeaCategory, setSelectedTeaCategory] = useState<string | null>(null);

  // Find spices category
  const spicesCategory = categories.find(c => c.name.toLowerCase() === 'spices');
  const teaCategories = categories.filter(c => c.name.toLowerCase() !== 'spices');

  // Separate products into tea and spices
  const teaProducts = useMemo(() => {
    const teas = products.filter(p => p.category_id !== spicesCategory?.id);
    if (!selectedTeaCategory) return teas;
    return teas.filter(p => p.category_id === selectedTeaCategory);
  }, [products, spicesCategory, selectedTeaCategory]);

  const spiceProducts = useMemo(() => {
    return products.filter(p => p.category_id === spicesCategory?.id);
  }, [products, spicesCategory]);

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
              Our Collection
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Premium Nilgiri teas and aromatic spices, sourced directly from Gudalur estates
            </p>
          </motion.div>
        </div>
      </section>


      {/* Products with Tabs */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <Tabs defaultValue="tea" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="tea" className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Premium Teas
              </TabsTrigger>
              <TabsTrigger value="spices" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Spices & Powders
              </TabsTrigger>
            </TabsList>

            {/* Tea Tab */}
            <TabsContent value="tea">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tea Category Filter */}
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                  <Button
                    variant={selectedTeaCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTeaCategory(null)}
                  >
                    All Teas
                  </Button>
                  {teaCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedTeaCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTeaCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Tea Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {teaProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {teaProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Leaf className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No teas found in this category.</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Spices Tab */}
            <TabsContent value="spices">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Spices Introduction */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                    Nilgiri Spices & Powders
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Hand-picked from the Nilgiri hills, our spices are sun-dried and 
                    processed naturally to retain their authentic aroma and flavor.
                  </p>
                </div>

                {/* Spices Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {spiceProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>

                {spiceProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Flame className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No spices available yet. Check back soon!</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
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
                      Browse our collection and choose your preferred tea or spices.
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