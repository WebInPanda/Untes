import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Customer, Sale, CartItem, STORAGE_KEYS } from '../lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { generateInvoice } from '../lib/pdfUtils';
import { Trash2 } from 'lucide-react';

export default function Sepet() {
  const [products, setProducts] = useLocalStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const [, setSales] = useLocalStorage<Sale[]>(STORAGE_KEYS.SALES_HISTORY, []);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState('none');
  
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const addToCart = (p: Product) => {
    const existing = cart.find(c => c.name === p.name);
    if (existing) {
      if (existing.qty >= p.stock) return;
      setCart(cart.map(c => c.name === p.name ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.price } : c));
    } else {
      setCart([...cart, { name: p.name, price: p.price, qty: 1, subtotal: p.price }]);
    }
  };

  const removeFromCart = (name: string) => {
    setCart(cart.filter(c => c.name !== name));
  };

  const updateQty = (name: string, qty: number) => {
    if (qty <= 0) return removeFromCart(name);
    const p = products.find(p => p.name === name);
    if (p && qty > p.stock) return;
    setCart(cart.map(c => c.name === name ? { ...c, qty, subtotal: qty * c.price } : c));
  };

  const baseTotal = cart.reduce((acc, c) => acc + c.subtotal, 0);
  const discountAmount = baseTotal * (discount / 100);
  const afterDiscount = baseTotal - discountAmount;
  const taxAmount = afterDiscount * (tax / 100);
  const finalTotal = parseFloat((afterDiscount + taxAmount).toFixed(2));

  const checkout = () => {
    if (cart.length === 0) return;
    
    // Deduct Stock
    setProducts(products.map(p => {
      const c = cart.find(item => item.name === p.name);
      return c ? { ...p, stock: p.stock - c.qty } : p;
    }));

    // Update Customer Balance
    if (customerId !== 'none') {
      setCustomers(customers.map(c => {
        if (c.name === customerId) {
          return {
            ...c,
            transactions: [{ amount: finalTotal, date: new Date().toISOString(), note: `Satış: ${cart.map(x => x.name).join(', ')}` }, ...c.transactions]
          };
        }
        return c;
      }));
    }

    // Save Sale
    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customer: customerId === 'none' ? 'Perakende Müşteri' : customerId,
      total: finalTotal,
      items: cart
    };
    setSales(prev => [sale, ...prev]);
    
    setCart([]);
    setDiscount(0);
    setTax(0);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6 p-6 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-4">
          <Input data-testid="input-search-cart-products" className="flex-1" placeholder="Ürün Ara..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger data-testid="select-filter-cart-cat"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {categories.map(c => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-20">
          {filtered.map((p, i) => {
            const inCart = cart.find(c => c.name === p.name)?.qty || 0;
            const remaining = p.stock - inCart;
            return (
              <Card key={i} data-testid={`card-cart-product-${i}`} className="flex flex-col justify-between">
                <CardContent className="p-4 flex flex-col gap-2 h-full">
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.category || 'Kategorisiz'}</div>
                  </div>
                  <div className="flex justify-between items-end mt-auto pt-2">
                    <div>
                      <div className="font-bold text-lg">{p.price} TL</div>
                      <div className={`text-xs ${remaining > 0 ? 'text-green-500' : 'text-destructive'}`}>Kalan: {remaining}</div>
                    </div>
                    <Button data-testid={`button-add-to-cart-${i}`} size="sm" onClick={() => addToCart(p)} disabled={remaining <= 0}>
                      Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex flex-col h-full min-h-[calc(100vh-4rem)] overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-4 border-b border-border bg-muted/20">
            <CardTitle>Sepet</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger data-testid="select-customer-cart"><SelectValue placeholder="Müşteri Seç" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Perakende Müşteri (Cari Hariç)</SelectItem>
                {customers.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {cart.map((c, i) => (
                <div key={i} data-testid={`cart-item-${i}`} className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.price} TL</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      data-testid={`input-cart-qty-${i}`}
                      type="number" 
                      value={c.qty} 
                      onChange={e => updateQty(c.name, parseInt(e.target.value) || 0)} 
                      className="w-16 h-8 text-center"
                    />
                    <div className="w-20 text-right font-bold">{c.subtotal} TL</div>
                    <Button data-testid={`button-remove-cart-item-${i}`} variant="ghost" size="icon" onClick={() => removeFromCart(c.name)}>
                      <Trash2 size={16} className="text-destructive"/>
                    </Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center text-muted-foreground mt-10">Sepet boş</div>}
            </div>

            <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{baseTotal} TL</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>İndirim (%{discount}):</span>
                  <span>-{discountAmount.toFixed(2)} TL</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>KDV (%{tax}):</span>
                  <span>+{taxAmount.toFixed(2)} TL</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold border-t border-border pt-2 mt-2 text-primary">
                <span>Genel Toplam:</span>
                <span data-testid="text-cart-total">{finalTotal} TL</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button data-testid="button-add-tax" variant="outline" className="flex-1" onClick={() => setTax(20)}>+%20 KDV</Button>
              <Button data-testid="button-add-discount" variant="outline" className="flex-1" onClick={() => setDiscount(10)}>-%10 İndirim</Button>
              <Button data-testid="button-clear-cart" variant="outline" className="flex-1" onClick={() => { setTax(0); setDiscount(0); setCart([]); }}>Sıfırla</Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button 
                data-testid="button-download-invoice"
                variant="secondary" 
                className="w-full sm:w-1/3 h-10 sm:h-auto" 
                onClick={() => generateInvoice(customerId === 'none' ? 'Perakende' : customerId, cart, finalTotal)}
                disabled={cart.length === 0}
              >
                🧾 PDF İndir
              </Button>
              <Button data-testid="button-checkout" className="flex-1 text-base sm:text-lg h-10 sm:h-auto" onClick={checkout} disabled={cart.length === 0}>
                Satışı Tamamla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
