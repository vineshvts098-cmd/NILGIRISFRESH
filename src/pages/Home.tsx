import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Shield, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import Layout from '@/components/layout/Layout';
import logo from '@/assets/logo.jpeg';
import spicesImage from '@/assets/spices-collage.jpeg';

export default function Home() {
  const { data: allProducts } = useProducts();
  const { data: categories } = useCategories();
  
  // Get featured teas (non-spice products)
  const spicesCategory = categories?.find(c => c.name === 'Spices');
  const featuredTeas = allProducts?.filter(p => p.featured && p.category_id !== spicesCategory?.id).slice(0, 4) || [];
  const featuredSpices = allProducts?.filter(p => p.category_id === spicesCategory?.id).slice(0, 6) || [];

  const features = [
    {
      icon: Leaf,
      title: 'Estate Fresh',
      description: 'Sourced directly from Gudalur tea estates within days of harvest',
    },
    {
      icon: Shield,
      title: 'Farmer Direct',
      description: 'We work with local farmers ensuring fair prices and quality',
    },
    {
      icon: Truck,
      title: 'Pan-India Delivery',
      description: 'Fresh tea delivered to your doorstep across India',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="container-custom relative">
          <div className="min-h-[85vh] md:min-h-[90vh] flex flex-col justify-center py-16 md:py-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-block text-sm md:text-base font-medium text-tea-gold mb-4 tracking-wide">
                  FROM THE NILGIRI HILLS
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
                  Pure Tea,<br />
                  <span className="text-tea-gold">Rooted in Tradition</span>
                </h1>
                <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed max-w-lg">
                  Experience the authentic taste of Nilgiri tea, sourced directly from 
                  the misty hills of Gudalur. Fresh, pure, and full of character.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button variant="hero" size="xl" asChild>
                  <Link to="/products">
                    Explore Our Teas
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="cream" size="xl" asChild>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5" />
                    Order Now
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Floating Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-tea-gold/20 rounded-full blur-3xl scale-150"></div>
                <img 
                  src={logo} 
                  alt="NilgirisFresh" 
                  className="relative w-72 xl:w-80 h-auto rounded-full shadow-2xl animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center p-6 md:p-8 bg-card rounded-xl shadow-elegant"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Our Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-4">
              Featured Teas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked selections from our finest estates in the Nilgiri hills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTeas.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button variant="default" size="lg" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Spices Section */}
      <section className="section-padding bg-gradient-to-br from-amber-900/10 via-background to-orange-900/10">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={spicesImage} 
                  alt="Premium Nilgiri Spices" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg">
                <span className="font-serif font-bold text-xl">100%</span>
                <span className="block text-sm">Natural</span>
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                From the Nilgiri Hills
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-6">
                Premium Spices & Powders
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Experience the authentic flavors of Nilgiri with our handpicked spices. 
                From aromatic black pepper to fragrant cardamom, our spices are sourced 
                directly from local farmers and processed with care to retain their natural oils and flavors.
              </p>

              {/* Spice Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {featuredSpices.map((spice, index) => (
                  <motion.div
                    key={spice.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 text-center hover:bg-card hover:shadow-md transition-all"
                  >
                    <h4 className="font-medium text-sm text-foreground">{spice.name}</h4>
                    <p className="text-xs text-muted-foreground">{spice.pack_size}</p>
                    <p className="text-sm font-semibold text-primary mt-1">₹{spice.price}</p>
                  </motion.div>
                ))}
              </div>

              <Button variant="default" size="lg" asChild>
                <Link to="/products">
                  Shop Spices
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Origin Story Teaser */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-6">
                From the Heart of Gudalur
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Nestled in the Western Ghats at over 1,000 meters above sea level, 
                Gudalur is home to some of India's finest tea estates. The unique 
                combination of altitude, rainfall, and soil creates tea with an 
                unmatched flavor profile.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We partner directly with small farmers who have cultivated tea for 
                generations, ensuring every cup you enjoy supports local communities 
                while delivering exceptional quality.
              </p>
              <Button variant="outline" asChild>
                <Link to="/about">
                  Read Our Full Story
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden">
                  <img 
                    src={logo} 
                    alt="Nilgiri Tea Estate" 
                    className="w-full h-full object-cover opacity-90"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground px-6 py-3 rounded-lg shadow-lg">
                  <span className="font-serif font-bold text-2xl">50+</span>
                  <span className="block text-sm">Partner Farmers</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How to Order CTA */}
      <section className="section-padding gradient-hero text-primary-foreground">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ordering Made Simple
            </h2>
            <p className="text-lg opacity-90 mb-8">
              No complicated checkout. Just select your tea, pay via UPI, and 
              confirm on WhatsApp. Your tea arrives fresh at your doorstep.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { step: '1', title: 'Choose', desc: 'Browse and select your favorite tea' },
                { step: '2', title: 'Pay', desc: 'Complete payment via UPI' },
                { step: '3', title: 'Confirm', desc: 'Send screenshot on WhatsApp' },
              ].map((item) => (
                <div key={item.step} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <span className="inline-block w-10 h-10 bg-tea-gold text-primary rounded-full font-bold text-lg flex items-center justify-center mb-3">
                    {item.step}
                  </span>
                  <h3 className="font-serif font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
            <Button variant="hero" size="xl" asChild>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
                <Phone className="w-5 h-5" />
                Start Ordering
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
