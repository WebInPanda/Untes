import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sale, STORAGE_KEYS } from '../lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SatisGecmisi() {
  const [sales, setSales] = useLocalStorage<Sale[]>(STORAGE_KEYS.SALES_HISTORY, []);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalCiro = sales.reduce((a, s) => a + s.total, 0);
  const totalSatis = sales.length;
  const totalUrun = sales.reduce((a, s) => a + s.items.reduce((acc, i) => acc + i.qty, 0), 0);
  const ortalama = totalSatis ? (totalCiro / totalSatis).toFixed(2) : 0;

  // En cok satanlar
  const productCounts: Record<string, number> = {};
  sales.forEach(s => {
    s.items.forEach(i => {
      productCounts[i.name] = (productCounts[i.name] || 0) + i.qty;
    });
  });
  const topProducts = Object.entries(productCounts).sort((a,b) => b[1] - a[1]).slice(0, 7);

  // En iyi musteriler
  const customerTotals: Record<string, number> = {};
  sales.forEach(s => {
    if (s.customer !== 'Perakende Müşteri') {
      customerTotals[s.customer] = (customerTotals[s.customer] || 0) + s.total;
    }
  });
  const topCustomers = Object.entries(customerTotals).sort((a,b) => b[1] - a[1]).slice(0, 5);

  const filtered = sales.filter(s => 
    s.customer.toLowerCase().includes(search.toLowerCase()) || 
    new Date(s.date).toLocaleDateString().includes(search)
  );

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Satış Geçmişi</h1>
        <Button data-testid="button-clear-sales-history" variant="destructive" onClick={() => { if(confirm("Tüm geçmiş silinecek! Emin misiniz?")) setSales([]) }}>
          Tüm Geçmişi Sil
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground"><CardContent className="p-4"><div className="text-sm opacity-80">Toplam Ciro</div><div data-testid="text-total-revenue" className="text-2xl font-bold">{totalCiro.toFixed(2)} TL</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Toplam Satış</div><div className="text-2xl font-bold">{totalSatis}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Satılan Ürün</div><div className="text-2xl font-bold">{totalUrun}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Ortalama Sepet</div><div className="text-2xl font-bold">{ortalama} TL</div></CardContent></Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-hidden">
          <Input data-testid="input-search-sales" placeholder="Müşteri veya Tarih (GG.AA.YYYY) ara..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filtered.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <div 
                  data-testid={`card-sale-${s.id}`}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{s.customer}</span>
                    <span className="text-sm text-muted-foreground">{new Date(s.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-primary">{s.total} TL</span>
                    {expanded === s.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
                {expanded === s.id && (
                  <div className="bg-muted/30 p-4 border-t border-border">
                    <div className="space-y-2">
                      {s.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.qty}x {item.name}</span>
                          <span>{item.subtotal} TL</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground pt-10">Kayıt bulunamadı.</p>}
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary">En Çok Satanlar</h3>
              <div className="space-y-3">
                {topProducts.map(([name, qty], i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{name}</span>
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">{qty} Adet</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-primary">En İyi Müşteriler</h3>
              <div className="space-y-3">
                {topCustomers.map(([name, total], i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="font-medium">{name}</span>
                    <span className="text-green-500 font-bold">{total.toFixed(2)} TL</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
