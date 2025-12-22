import { motion } from 'framer-motion';
import { Building2, Truck, Phone, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSettings } from '@/lib/store';

export default function BulkEnquiry() {
  const settings = getSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    quantity: '',
    requirements: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = encodeURIComponent(
      `*BULK ORDER ENQUIRY*\n\n` +
      `*Business Name:* ${formData.businessName}\n` +
      `*Contact Person:* ${formData.contactPerson}\n` +
      `*Email:* ${formData.email}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Business Type:* ${formData.businessType}\n` +
      `*Monthly Quantity:* ${formData.quantity}\n\n` +
      `*Requirements:*\n${formData.requirements}`
    );
    
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
    
    toast({
      title: "Enquiry submitted!",
      description: "Our team will contact you within 24 hours.",
    });
    
    setFormData({
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      businessType: '',
      quantity: '',
      requirements: '',
    });
  };

  const benefits = [
    'Competitive wholesale pricing',
    'Consistent quality supply',
    'Flexible order quantities',
    'Priority customer support',
    'Custom packaging available',
    'Direct estate sourcing',
  ];

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
              Bulk & Dealer Enquiry
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Partner with us for your business tea needs. Hotels, restaurants, 
              retailers, and distributors welcome.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Building2, title: 'For Businesses', desc: 'Hotels, restaurants, cafes, and offices' },
              { icon: Truck, title: 'For Retailers', desc: 'Grocery stores and supermarkets' },
              { icon: Phone, title: 'For Distributors', desc: 'Regional and wholesale distributors' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 text-center shadow-elegant"
              >
                <item.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
                Why Partner With Us?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 bg-secondary/50 rounded-xl">
                <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                  Minimum Order Quantity
                </h3>
                <p className="text-muted-foreground mb-4">
                  We accept bulk orders starting from 10 kg per variant. 
                  Special pricing available for orders above 50 kg.
                </p>
                <Button variant="whatsapp" asChild>
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-4 h-4" />
                    Discuss Requirements
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Enquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-elegant">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">
                  Submit Enquiry
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="business@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel / Resort</SelectItem>
                        <SelectItem value="restaurant">Restaurant / Cafe</SelectItem>
                        <SelectItem value="retailer">Retail Store</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="corporate">Corporate / Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Expected Monthly Quantity</Label>
                    <Select
                      value={formData.quantity}
                      onValueChange={(value) => setFormData({ ...formData, quantity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quantity range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10-25kg">10 - 25 kg</SelectItem>
                        <SelectItem value="25-50kg">25 - 50 kg</SelectItem>
                        <SelectItem value="50-100kg">50 - 100 kg</SelectItem>
                        <SelectItem value="100kg+">100+ kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requirements">Additional Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Any specific requirements or questions..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Submit Enquiry
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
