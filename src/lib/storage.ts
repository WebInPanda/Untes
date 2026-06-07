export type Transaction = { amount: number; date: string; note?: string; };
export type Customer = { name: string; note?: string; transactions: Transaction[]; };
export type Product = { name: string; price: number; stock: number; category?: string; };
export type CartItem = { name: string; qty: number; price: number; subtotal: number; };
export type Sale = { id: string; date: string; customer: string; total: number; items: CartItem[]; };

export const STORAGE_KEYS = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SALES_HISTORY: 'salesHistory',
};

// Initial data loaders
export const getCustomers = (): Customer[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
export const setCustomers = (customers: Customer[]) => localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

export const getProducts = (): Product[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
export const setProducts = (products: Product[]) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

export const getCategories = (): string[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
export const setCategories = (categories: string[]) => localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

export const getSalesHistory = (): Sale[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES_HISTORY) || '[]');
export const setSalesHistory = (history: Sale[]) => localStorage.setItem(STORAGE_KEYS.SALES_HISTORY, JSON.stringify(history));
