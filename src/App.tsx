import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import BulkEnquiry from "./pages/BulkEnquiry";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import MyOrders from "./pages/MyOrders";
import { Navigate } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import OrderConfirmed from "./pages/OrderConfirmed";
import { useEffect } from "react";

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only retry once on failure (default is 3x which causes 30+ second hangs)
      retry: 1,
      retryDelay: 2000,
      // Cache data for 5 minutes so repeat page visits feel instant
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/bulk-enquiry" element={<BulkEnquiry />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/my-orders" element={<MyOrders />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                <Route path="/order-confirmed" element={<OrderConfirmed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
