import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  city: string;
  state: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600 bg-blue-100', label: 'Confirmed' },
  shipped: { icon: Truck, color: 'text-purple-600 bg-purple-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Cancelled' },
};

export default function MyOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Order[];
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            My Orders
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const orderItems = order.order_items as OrderItem[];

              return (
                <div key={order.id} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order ID: <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="space-y-2">
                      {orderItems.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.name} ({item.packSize}) × {item.quantity}
                          </span>
                          <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      {orderItems.length > 2 && (
                        <p className="text-sm text-muted-foreground">
                          +{orderItems.length - 2} more items
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-lg font-semibold text-primary">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
