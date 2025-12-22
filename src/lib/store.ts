// Simple localStorage-based store for products and categories
// This will be replaced with a proper backend later

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  packSize: string;
  category: string;
  image: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  phone: string;
  email: string;
  address: string;
  upiId: string;
  whatsappNumber: string;
}

const PRODUCTS_KEY = 'nilgirisfresh_products';
const CATEGORIES_KEY = 'nilgirisfresh_categories';
const SETTINGS_KEY = 'nilgirisfresh_settings';

// Default data
const defaultCategories: Category[] = [
  { id: '1', name: 'Premium Tea', description: 'Our finest selection of handpicked teas' },
  { id: '2', name: 'Classic Tea', description: 'Traditional Nilgiri tea blends' },
  { id: '3', name: 'Special Blends', description: 'Unique flavor combinations' },
];

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Nilgiri Premium Dust',
    description: 'Our signature strong tea dust, perfect for a robust morning cup. Sourced from the finest estates in Gudalur.',
    price: 180,
    packSize: '250g',
    category: '1',
    image: '/product-sample.png',
    featured: true,
  },
  {
    id: '2',
    name: 'Classic CTC Tea',
    description: 'Traditional CTC tea with rich color and bold flavor. Ideal for milk tea lovers.',
    price: 150,
    packSize: '250g',
    category: '2',
    image: '/product-sample.png',
    featured: true,
  },
  {
    id: '3',
    name: 'Green Leaf Tea',
    description: 'Whole leaf green tea with natural antioxidants. Light, refreshing, and healthy.',
    price: 220,
    packSize: '100g',
    category: '3',
    image: '/product-sample.png',
    featured: true,
  },
  {
    id: '4',
    name: 'Family Pack Dust',
    description: 'Economical family pack of our popular tea dust. Great value for daily use.',
    price: 350,
    packSize: '500g',
    category: '2',
    image: '/product-sample.png',
    featured: false,
  },
  {
    id: '5',
    name: 'Premium Leaf Tea',
    description: 'Hand-rolled whole leaf tea with delicate aroma. For the tea connoisseur.',
    price: 280,
    packSize: '200g',
    category: '1',
    image: '/product-sample.png',
    featured: false,
  },
  {
    id: '6',
    name: 'Masala Chai Blend',
    description: 'Pre-mixed spiced tea with cardamom, ginger, and cinnamon. Just add milk and water.',
    price: 200,
    packSize: '200g',
    category: '3',
    image: '/product-sample.png',
    featured: true,
  },
];

const defaultSettings: SiteSettings = {
  heroTitle: 'Pure Tea from the Nilgiri Hills',
  heroSubtitle: 'From the Hills to Your Cup',
  phone: '+91 98765 43210',
  email: 'hello@nilgirisfresh.com',
  address: 'Gudalur, Nilgiris District, Tamil Nadu, India - 643212',
  upiId: 'vineshvts098@okicici',
  whatsappNumber: '919876543210',
};

// Products
export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now().toString() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

// Categories
export function getCategories(): Category[] {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  return defaultCategories;
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function addCategory(category: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const newCategory = { ...category, id: Date.now().toString() };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): void {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);
  }
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter(c => c.id !== id);
  saveCategories(categories);
}

// Settings
export function getSettings(): SiteSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
}

export function saveSettings(settings: SiteSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Helper to generate WhatsApp order link
export function generateWhatsAppLink(product: Product, settings: SiteSettings): string {
  const message = encodeURIComponent(
    `Hi! I would like to order:\n\n` +
    `*${product.name}*\n` +
    `Pack Size: ${product.packSize}\n` +
    `Price: ₹${product.price}\n\n` +
    `Please confirm availability and payment details.`
  );
  return `https://wa.me/${settings.whatsappNumber}?text=${message}`;
}

// Helper to generate UPI payment link
export function generateUPILink(amount: number, settings: SiteSettings, productName: string): string {
  const note = encodeURIComponent(`NilgirisFresh - ${productName}`);
  return `upi://pay?pa=${settings.upiId}&pn=NilgirisFresh&am=${amount}&cu=INR&tn=${note}`;
}
