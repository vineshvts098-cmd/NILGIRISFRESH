import { useState } from 'react';
import { Save } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SiteSettings, getSettings, saveSettings } from '@/lib/store';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    toast({ title: 'Settings saved successfully!' });
  };

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
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Tagline / Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
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
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={settings.address}
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
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
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
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="919876543210 (with country code, no +)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code without + or spaces (e.g., 919876543210)
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
