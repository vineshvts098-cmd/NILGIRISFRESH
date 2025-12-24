import React, { useState } from 'react';
import { Package, Eye, Clock, CheckCircle, Truck, XCircle, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  packSize: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: unknown;
  customer_name: string;
  phone: string;
  email: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  payment_screenshot_url: string | null;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600 bg-blue-100' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-600 bg-purple-100' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-100' },
];

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [signedScreenshotUrl, setSignedScreenshotUrl] = useState<string | null>(null);
  const [isLoadingScreenshot, setIsLoadingScreenshot] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order status updated!' });
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
  });

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setSignedScreenshotUrl(null);
    
    // Generate signed URL for payment screenshot if exists
    if (order.payment_screenshot_url) {
      setIsLoadingScreenshot(true);
      try {
        // Check if it's already a signed URL (from old orders) or just a filename
        const fileName = order.payment_screenshot_url.includes('/')
          ? order.payment_screenshot_url.split('/').pop()!
          : order.payment_screenshot_url;
        
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .createSignedUrl(fileName, 3600); // 1 hour expiry
        
        if (!error && data?.signedUrl) {
          setSignedScreenshotUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Failed to load screenshot:', err);
      } finally {
        setIsLoadingScreenshot(false);
      }
    }
  };

  const filteredOrders = orders?.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          Manage customer orders
        </p>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {statusOptions.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-border">
              {filteredOrders?.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <div key={order.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold text-primary">₹{order.total_amount}</span>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatus.mutate({ id: order.id, status: value })}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-4 px-4 font-medium text-foreground">Order ID</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Customer</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Date</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Amount</th>
                    <th className="text-left py-4 px-4 font-medium text-foreground">Status</th>
                    <th className="text-right py-4 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders?.map((order) => {
                    const status = getStatusConfig(order.status);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={order.id} className="border-b border-border last:border-0">
                        <td className="py-4 px-4 font-mono text-muted-foreground">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-4 px-4 font-semibold text-foreground">
                          ₹{order.total_amount}
                        </td>
                        <td className="py-4 px-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateStatus.mutate({ id: order.id, status: value })}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <div className={`flex items-center gap-1 ${status.color.split(' ')[0]}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(s => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Customer Info</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Shipping Address</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.address_line1}<br />
                  {selectedOrder.address_line2 && <>{selectedOrder.address_line2}<br /></>}
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Order Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.order_items as OrderItem[]).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} ({item.packSize}) × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.payment_screenshot_url && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Payment Screenshot</h4>
                  {isLoadingScreenshot ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading screenshot...
                    </div>
                  ) : signedScreenshotUrl ? (
                    <a 
                      href={signedScreenshotUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Screenshot →
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Screenshot unavailable</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
