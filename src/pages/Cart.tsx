import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Upload, ExternalLink, ArrowLeft, LogIn } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings, generateWhatsAppLink, generateUPILink } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import productSample from '@/assets/product-sample.png';
import { z } from 'zod';

// Order form validation schema
const orderSchema = z.object({
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number (10-15 digits)'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  addressLine1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  addressLine2: z.string().max(200, 'Address must be less than 200 characters').optional().or(z.literal('')),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State must be less than 100 characters'),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

// Sanitize text for WhatsApp messages to prevent injection
const sanitizeForWhatsApp = (text: string): string => {
  return text
    .replace(/[*_~`]/g, '') // Remove WhatsApp formatting chars
    .replace(/\n+/g, ' ')   // Replace newlines with spaces
    .trim()
    .substring(0, 500);     // Limit length
};

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { data: settings } = useSiteSettings();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user && items.length > 0) {
      // Only require login when trying to checkout
    }
  }, [user, authLoading, items.length]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const upiLink = settings?.upi_id 
    ? generateUPILink(totalAmount, settings.upi_id, 'Order Payment')
    : '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Check if user is signed in before allowing order
    if (!user) {
      toast({ 
        title: 'Please sign in to place an order', 
        description: 'You need to be signed in to complete your purchase.',
        variant: 'destructive' 
      });
      navigate('/auth', { state: { from: '/cart' } });
      return;
    }
    
    if (items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    if (!paymentScreenshot) {
      toast({ title: 'Please upload payment screenshot', variant: 'destructive' });
      return;
    }

    // Validate form data
    const validationResult = orderSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({ title: 'Please fix the form errors', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload payment screenshot
      const fileExt = paymentScreenshot.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, paymentScreenshot);

      if (uploadError) throw uploadError;

      // Create order in database with validated data
      const validatedData = validationResult.data;
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        packSize: item.packSize,
      }));

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: validatedData.customerName,
          phone: validatedData.phone,
          email: validatedData.email || null,
          address_line1: validatedData.addressLine1,
          address_line2: validatedData.addressLine2 || null,
          city: validatedData.city,
          state: validatedData.state,
          pincode: validatedData.pincode,
          payment_screenshot_url: fileName, // Store filename only for admin signed access
          order_items: orderItems,
          total_amount: totalAmount,
          user_id: user?.id,
        });

      if (orderError) throw orderError;

      // Generate WhatsApp message with sanitized inputs (no signed URL for security)
      const sanitizedItemsList = items.map(item => 
        `• ${sanitizeForWhatsApp(item.name)} (${sanitizeForWhatsApp(item.packSize)}) x${item.quantity} = ₹${item.price * item.quantity}`
      ).join('\n');

      const message = `🛒 *New Order from NilgirisFresh*\n\n` +
        `*Customer Details:*\n` +
        `Name: ${sanitizeForWhatsApp(validatedData.customerName)}\n` +
        `Phone: ${sanitizeForWhatsApp(validatedData.phone)}\n` +
        `${validatedData.email ? `Email: ${sanitizeForWhatsApp(validatedData.email)}\n` : ''}` +
        `\n*Shipping Address:*\n` +
        `${sanitizeForWhatsApp(validatedData.addressLine1)}\n` +
        `${validatedData.addressLine2 ? sanitizeForWhatsApp(validatedData.addressLine2) + '\n' : ''}` +
        `${sanitizeForWhatsApp(validatedData.city)}, ${sanitizeForWhatsApp(validatedData.state)} - ${sanitizeForWhatsApp(validatedData.pincode)}\n\n` +
        `*Order Items:*\n${sanitizedItemsList}\n\n` +
        `*Total Amount: ₹${totalAmount}*\n\n` +
        `_Payment screenshot uploaded - view in admin panel_`;

      const whatsappUrl = generateWhatsAppLink(message, settings?.whatsapp_number || '919876543210');
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Clear cart and form
      clearCart();
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
      });
      setPaymentScreenshot(null);
      setPreviewUrl(null);
      setValidationErrors({});

      toast({ title: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({ title: 'Failed to place order', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Your Cart ({items.length} items)
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cart Items</h2>
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-card p-4 rounded-lg shadow-sm">
                <img
                  src={item.image_url || productSample}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.packSize}</p>
                  <p className="text-primary font-semibold">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-card p-6 rounded-xl shadow-sm">
            {/* Sign in prompt for non-authenticated users */}
            {!authLoading && !user && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <LogIn className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Sign in to complete your order
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                      You need to be signed in to place an order and track your purchases.
                    </p>
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/auth" state={{ from: '/cart' }}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign in to Checkout
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  maxLength={100}
                  className={validationErrors.customerName ? 'border-destructive' : ''}
                />
                {validationErrors.customerName && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    maxLength={15}
                    className={validationErrors.phone ? 'border-destructive' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={255}
                    className={validationErrors.email ? 'border-destructive' : ''}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Textarea
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                  rows={2}
                  maxLength={200}
                  className={validationErrors.addressLine1 ? 'border-destructive' : ''}
                />
                {validationErrors.addressLine1 && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.addressLine1}</p>
                )}
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    maxLength={100}
                    className={validationErrors.city ? 'border-destructive' : ''}
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    maxLength={100}
                    className={validationErrors.state ? 'border-destructive' : ''}
                  />
                  {validationErrors.state && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.state}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                    maxLength={6}
                    className={validationErrors.pincode ? 'border-destructive' : ''}
                  />
                  {validationErrors.pincode && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-border pt-4 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Payment</h3>
                
                <div className="bg-secondary/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pay ₹{totalAmount} using UPI and upload the screenshot below
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={upiLink}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Pay ₹{totalAmount} via UPI (GPay/PhonePe)
                    </a>
                  </Button>
                </div>

                <div>
                  <Label>Upload Payment Screenshot *</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Payment screenshot" className="max-h-48 mx-auto rounded" />
                    ) : (
                      <div className="py-8">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Place Order via WhatsApp'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}