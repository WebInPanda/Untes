import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Customer, STORAGE_KEYS } from '../lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CustomerModal from '../components/CustomerModal';

export default function Musteriler() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [search, setSearch] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addCustomer = () => {
    if (!name) return;
    if (customers.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert("Bu isimde bir müşteri zaten var.");
      return;
    }
    const initialAmount = parseFloat(balance) || 0;
    const newCustomer: Customer = {
      name,
      transactions: initialAmount ? [{ amount: initialAmount, date: new Date().toISOString(), note: 'Açılış Bakiyesi' }] : []
    };
    setCustomers([...customers, newCustomer]);
    setName('');
    setBalance('');
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map(c => c.name === updated.name ? updated : c));
    setSelectedCustomer(updated);
  };

  const handleDeleteCustomer = (name: string) => {
    if(confirm("Müşteriyi silmek istediğinize emin misiniz?")) {
       setCustomers(customers.filter(c => c.name !== name));
    }
  };

  const openCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 p-6">
      <div className="w-full md:w-1/3">
        <Card>
          <CardHeader><CardTitle>Yeni Müşteri Ekle</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input data-testid="input-customer-name" placeholder="Müşteri Adı" value={name} onChange={e => setName(e.target.value)} />
            <Input data-testid="input-customer-balance" placeholder="Başlangıç Bakiyesi (+Borç, -Alacak)" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
            <Button data-testid="button-create-customer" onClick={addCustomer}>Oluştur</Button>
          </CardContent>
        </Card>
      </div>
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <Input data-testid="input-search-customers" placeholder="Müşteri Ara..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((c, i) => {
            const total = c.transactions.reduce((acc, t) => acc + t.amount, 0);
            return (
              <Card key={i} data-testid={`card-customer-${i}`} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openCustomer(c)}>
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="font-medium text-lg" data-testid={`text-customer-name-${i}`}>{c.name}</span>
                  <span data-testid={`text-customer-balance-${i}`} className={`font-bold ${total > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.abs(total)} TL {total > 0 ? 'Borç' : 'Alacak'}
                  </span>
                </CardContent>
              </Card>
            )
          })}
          {filtered.length === 0 && <div className="text-muted-foreground col-span-2 text-center py-8">Müşteri bulunamadı.</div>}
        </div>
      </div>

      <CustomerModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        customer={selectedCustomer} 
        onUpdate={handleUpdateCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
}
