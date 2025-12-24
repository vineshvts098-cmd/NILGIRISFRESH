import { motion } from 'framer-motion';
import { MapPin, Users, Heart, Leaf } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import gudalurLandscape from '@/assets/gudalur-landscape.jpg';

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: 'Quality First',
      description: 'We never compromise on the quality of our tea. Every batch is carefully selected and tested.',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Our partnerships with local farmers ensure fair trade and sustainable livelihoods.',
    },
    {
      icon: Heart,
      title: 'Passionate Craft',
      description: 'Tea is not just a product for us—it\'s a tradition we\'re honored to carry forward.',
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-sm font-medium text-tea-gold uppercase tracking-wider">
              Our Story
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2 mb-6">
              From the Hills of Gudalur
            </h1>
            <p className="text-lg opacity-90 leading-relaxed">
              A journey that began with a simple love for authentic tea, 
              and a mission to bring the finest Nilgiri flavors to every home.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="aspect-[4/3] bg-secondary rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={gudalurLandscape} 
                    alt="Beautiful Gudalur Tea Estates in Nilgiri Hills" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-card shadow-elegant rounded-xl p-4 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-accent" />
                  <div>
                    <span className="font-serif font-bold text-lg text-foreground">Gudalur</span>
                    <span className="block text-sm text-muted-foreground">Nilgiris, Tamil Nadu</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm font-medium text-accent uppercase tracking-wider">
                The Nilgiri Difference
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-6">
                Where Every Leaf Tells a Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Gudalur, nestled at the confluence of Kerala, Karnataka, and Tamil Nadu, 
                  sits at an elevation of over 1,000 meters in the majestic Nilgiri Hills. 
                  This unique geography creates a microclimate perfect for growing tea with 
                  exceptional character.
                </p>
                <p>
                  The morning mists, consistent rainfall, and mineral-rich soil combine to 
                  produce tea leaves with a distinctive briskness and natural sweetness that's 
                  impossible to replicate elsewhere.
                </p>
                <p>
                  For generations, small farmers in this region have cultivated tea using 
                  traditional methods passed down through families. We're proud to work 
                  directly with over 50 of these farming families, ensuring they receive 
                  fair compensation while we bring you the freshest tea possible.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-6">
              Bringing Authenticity to Every Cup
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              In a market flooded with blended and processed teas, we stand for something 
              different—single-origin, estate-fresh tea that celebrates the true essence 
              of Nilgiri.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 md:p-8 text-center shadow-elegant"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">
              From Estate to Your Home
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Harvest', desc: 'Hand-picked by experienced farmers during peak season' },
              { step: '02', title: 'Process', desc: 'Traditional processing within hours of plucking' },
              { step: '03', title: 'Quality Check', desc: 'Rigorous testing for flavor, aroma, and freshness' },
              { step: '04', title: 'Pack & Ship', desc: 'Sealed fresh and delivered to your doorstep' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-serif font-bold text-primary/10 mb-2">
                  {item.step}
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="section-padding gradient-hero text-primary-foreground">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Why Trust NilgirisFresh?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '50+', label: 'Partner Farmers' },
                { value: '1000+', label: 'Happy Customers' },
                { value: '100%', label: 'Pure Nilgiri' },
                { value: '48hrs', label: 'Farm to Pack' },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block font-serif text-3xl md:text-4xl font-bold text-tea-gold">
                    {stat.value}
                  </span>
                  <span className="text-sm opacity-80">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}