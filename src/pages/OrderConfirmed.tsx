import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function OrderConfirmed() {
    const location = useLocation();
    const { orderId } = location.state || {}; // In a real app we'd fetch order details

    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                        Thank you for your purchase. Your order has been placed successfully and is being processed.
                    </p>

                    <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto mb-8 shadow-sm">
                        <p className="text-sm text-muted-foreground mb-2">
                            You will receive a confirmation on WhatsApp shortly.
                        </p>
                        {orderId && (
                            <p className="font-mono text-sm bg-secondary py-1 px-3 rounded inline-block">
                                Order ID: {orderId}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="gap-2">
                            <Link to="/products">
                                <Package className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2">
                            <Link to="/">
                                <Home className="w-4 h-4" />
                                Return Home
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
