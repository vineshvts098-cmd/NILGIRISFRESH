import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Shield, Phone, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, useCategories } from '@/hooks/useProducts';
import Layout from '@/components/layout/Layout';
import gudalurLandscape from '@/assets/gudalur-landscape.jpg';
import spicesImage from '@/assets/spices-collage.jpeg';

export default function Home() {
  const { data: allProducts } = useProducts();
  const { data: categories } = useCategories();

  // Get featured teas (non-spice products)
  const spicesCategory = categories?.find(c => c.name.toLowerCase() === 'spices');
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
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-[90vh] md:min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={gudalurLandscape}
            alt="Beautiful Gudalur Tea Estates"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-tea-gold/30 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: '100%',
                opacity: 0
              }}
              animate={{
                y: '-10%',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear'
              }}
            />
          ))}
        </div>

        <div className="container-custom relative z-10">
          <div className="min-h-[90vh] md:min-h-screen flex flex-col justify-center py-16 md:py-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6 text-primary-foreground">
                  Pure Tea & Spices,<br />
                  <span className="text-tea-gold drop-shadow-lg">Rooted in Tradition</span>
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-lg">
                  Experience the authentic taste of Nilgiri tea & spices, sourced directly from
                  the misty hills of Gudalur. Fresh, pure, and full of character.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button variant="hero" size="xl" asChild className="shadow-xl">
                  <Link to="/products">
                    Explore Our Collection
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="cream" size="xl" asChild className="shadow-xl">
                  <a href="https://wa.me/919025003946" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5" />
                    Order via WhatsApp
                  </a>
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 flex gap-8 flex-wrap"
              >
                {[
                  { value: '50+', label: 'Partner Farmers' },
                  { value: '100%', label: 'Pure Nilgiri' },
                  { value: '3-7days', label: 'Fresh Delivery' },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-primary-foreground">
                    <span className="block text-2xl md:text-3xl font-serif font-bold text-tea-gold">{stat.value}</span>
                    <span className="text-sm opacity-80">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
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
                className="flex flex-col items-center text-center p-6 md:p-8 bg-card rounded-xl shadow-elegant hover:shadow-2xl transition-shadow"
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

      {/* Featured Teas */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent uppercase tracking-wider">
              <Leaf className="w-4 h-4" />
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
                View All Teas
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
              <span className="inline-flex items-center gap-2 text-sm font-medium text-accent uppercase tracking-wider">
                <Flame className="w-4 h-4" />
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
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={gudalurLandscape}
                    alt="Nilgiri Tea Estate in Gudalur"
                    className="w-full h-full object-cover"
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
              No complicated checkout. Just select your tea, pay securely online, and confirm your order instantly. Your tea arrives fresh at your doorstep.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { step: '1', title: 'Choose', desc: 'Browse and select your favorite tea or spices' },
                { step: '2', title: 'Pay', desc: 'Pay securely via Razorpay (UPI, cards, wallets)' },
                { step: '3', title: 'Confirm', desc: 'Order is confirmed and you get a WhatsApp message' },
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
              <a href="https://wa.me/919025003946" target="_blank" rel="noopener noreferrer">
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