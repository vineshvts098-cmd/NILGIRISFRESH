import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { getSettings } from '@/lib/store';

export default function FAQ() {
  const settings = getSettings();

  const faqs = [
    {
      category: 'Ordering & Payment',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Ordering is simple! Browse our products, select what you want, and click "Order via WhatsApp." Pay via UPI to our ID, then share the payment screenshot on WhatsApp to confirm your order.',
        },
        {
          q: 'What payment methods do you accept?',
          a: `We accept UPI payments only. Our UPI ID is: ${settings.upiId}. You can pay using any UPI app like Google Pay, PhonePe, Paytm, or your bank's UPI app.`,
        },
        {
          q: 'Is online payment secure?',
          a: 'Yes, UPI payments are processed through your bank\'s secure infrastructure. We never have access to your bank details. You simply transfer to our verified UPI ID.',
        },
        {
          q: 'How do I confirm my order after payment?',
          a: 'After making the payment, take a screenshot and send it to us on WhatsApp along with your delivery address. We\'ll confirm your order within 2-4 hours during business hours.',
        },
      ],
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          q: 'Do you deliver across India?',
          a: 'Yes, we deliver to most pincodes across India. Shipping charges vary based on location. Contact us on WhatsApp for exact delivery charges to your location.',
        },
        {
          q: 'How long does delivery take?',
          a: 'Standard delivery takes 5-7 business days for most locations. Metro cities may receive orders faster. You\'ll receive tracking details once shipped.',
        },
        {
          q: 'Do you offer free shipping?',
          a: 'Yes! We offer free shipping on orders above ₹500 to most locations. For bulk orders, special shipping rates apply.',
        },
        {
          q: 'Can I track my order?',
          a: 'Absolutely! Once your order is shipped, we\'ll share the tracking number and courier details on WhatsApp. You can track your package through the courier\'s website.',
        },
      ],
    },
    {
      category: 'Products & Quality',
      questions: [
        {
          q: 'Where does your tea come from?',
          a: 'All our tea is sourced from Gudalur in the Nilgiri Hills of Tamil Nadu. We work directly with small farmers who have been growing tea for generations.',
        },
        {
          q: 'Is your tea certified organic?',
          a: 'While we don\'t currently hold organic certification, our partner farmers use minimal chemicals and follow sustainable practices. We focus on freshness and quality over certifications.',
        },
        {
          q: 'How fresh is your tea?',
          a: 'Very fresh! Our tea goes from processing to packaging within 48 hours of harvest. We ship in small batches to ensure you always receive recently packed tea.',
        },
        {
          q: 'How should I store the tea?',
          a: 'Store in an airtight container in a cool, dry place away from direct sunlight. Properly stored, our tea stays fresh for up to 12 months, though we recommend consuming within 6 months for best flavor.',
        },
      ],
    },
    {
      category: 'Returns & Support',
      questions: [
        {
          q: 'What if I receive damaged products?',
          a: 'If you receive damaged or incorrect products, contact us immediately on WhatsApp with photos. We\'ll arrange a replacement or refund at no extra cost.',
        },
        {
          q: 'Can I return products if I don\'t like them?',
          a: 'Due to the nature of food products, we cannot accept returns for taste preferences. However, if there\'s a quality issue, we\'re happy to help. Reach out within 7 days of delivery.',
        },
        {
          q: 'How can I contact customer support?',
          a: `The fastest way is WhatsApp. You can also email us at ${settings.email} or call ${settings.phone} during business hours (9 AM - 6 PM, Mon-Sat).`,
        },
      ],
    },
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
              Frequently Asked Questions
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Find answers to common questions about ordering, shipping, and our products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          {faqs.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-10"
            >
              <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-4">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {section.questions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${section.category}-${index}`}
                    className="bg-card rounded-lg border-none shadow-sm"
                  >
                    <AccordionTrigger className="px-5 py-4 text-left font-medium text-foreground hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-primary/5 rounded-xl p-6 md:p-8 text-center"
          >
            <h3 className="text-xl font-serif font-bold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? We're here to help!
            </p>
            <Button variant="whatsapp" size="lg" asChild>
              <a 
                href={`https://wa.me/${settings.whatsappNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Phone className="w-5 h-5" />
                Chat with Us
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
