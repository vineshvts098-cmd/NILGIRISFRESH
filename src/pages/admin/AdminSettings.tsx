import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings, useUpdateSiteSettings, SiteSettings } from '@/hooks/useProducts';

export default function AdminSettings() {
  const { data: siteSettings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    hero_title: '',
    hero_subtitle: '',
    phone: '',
    email: '',
    address: '',
    upi_id: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    if (siteSettings) {
      setSettings({
        id: siteSettings.id,
        hero_title: siteSettings.hero_title || '',
        hero_subtitle: siteSettings.hero_subtitle || '',
        phone: siteSettings.phone || '',
        email: siteSettings.email || '',
        address: siteSettings.address || '',
        upi_id: siteSettings.upi_id || '',
        whatsapp_number: siteSettings.whatsapp_number || '',
      });
    }
  }, [siteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.id) {
      toast({ title: 'Error', description: 'Settings not loaded yet', variant: 'destructive' });
      return;
    }
    
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        upi_id: settings.upi_id,
        whatsapp_number: settings.whatsapp_number,
      });
      toast({ title: 'Settings saved successfully!' });
    } catch (error) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-6">
          Update your website content and contact information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Section */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
              Homepage Hero
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={settings.hero_title || ''}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Tagline / Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={settings.hero_subtitle || ''}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment & WhatsApp */}
          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
              Payment & WhatsApp
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={settings.upi_id || ''}
                  onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                  placeholder="yourname@upi"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be shown to customers for payments
                </p>
              </div>
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={settings.whatsapp_number || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="919876543210 (with country code, no +)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code without + or spaces (e.g., 919876543210)
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
