import { Package, FolderOpen, DollarSign, TrendingUp } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getProducts, getCategories } from '@/lib/store';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const products = getProducts();
  const categories = getCategories();

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      icon: Package,
      link: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: FolderOpen,
      link: '/admin/categories',
      color: 'bg-green-500',
    },
    {
      name: 'Featured Products',
      value: products.filter(p => p.featured).length,
      icon: TrendingUp,
      link: '/admin/products',
      color: 'bg-yellow-500',
    },
    {
      name: 'Avg. Price',
      value: `₹${Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length || 0)}`,
      icon: DollarSign,
      link: '/admin/products',
      color: 'bg-purple-500',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl p-6 shadow-sm mb-8">
        <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add New Product
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Update Settings
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <h3 className="font-serif font-semibold text-lg text-foreground mb-4">
          Recent Products
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pack Size</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Featured</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-foreground">{product.name}</td>
                  <td className="py-3 px-4 text-foreground">₹{product.price}</td>
                  <td className="py-3 px-4 text-muted-foreground">{product.packSize}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${product.featured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {product.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
