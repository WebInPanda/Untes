import React, { useState, useEffect } from 'react';
import { Customer, Transaction } from '../lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateCustomerStatement } from '../lib/pdfUtils';
import { Trash2 } from 'lucide-react';

interface CustomerModalProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (customerName: string) => void;
}

export default function CustomerModal({ customer, open, onOpenChange, onUpdate, onDelete }: CustomerModalProps) {
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (customer) {
      setNote(customer.note || '');
      setDate(new Date().toISOString().slice(0, 16));
    }
  }, [customer]);

  if (!customer) return null;

  const total = customer.transactions.reduce((acc, t) => acc + t.amount, 0);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    onUpdate({ ...customer, note: newNote });
  };

  const addTransaction = (isDebt: boolean) => {
    const val = parseFloat(amount);
    if (!val || isNaN(val) || !desc) return;
    
    const signedVal = isDebt ? Math.abs(val) : -Math.abs(val);
    const newT: Transaction = {
      amount: signedVal,
      date: date || new Date().toISOString(),
      note: desc
    };
    
    onUpdate({ ...customer, transactions: [newT, ...customer.transactions] });
    setAmount('');
    setDesc('');
  };

  const deleteTransaction = (idx: number) => {
    const newT = [...customer.transactions];
    newT.splice(idx, 1);
    onUpdate({ ...customer, transactions: newT });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="modal-customer" className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex justify-between items-center">
            <span>{customer.name}</span>
            <span className={total > 0 ? 'text-red-500' : 'text-green-500'}>
              {Math.abs(total)} TL {total > 0 ? 'Borç' : 'Alacak'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Müşteri Notu</h3>
            <Textarea 
              data-testid="textarea-customer-note"
              placeholder="Müşteri hakkında notlar..." 
              value={note} 
              onChange={handleNoteChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm">Yeni İşlem Ekle</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input data-testid="input-transaction-desc" placeholder="Açıklama" value={desc} onChange={e => setDesc(e.target.value)} />
              <Input data-testid="input-transaction-date" placeholder="Tarih" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <Input data-testid="input-transaction-amount" placeholder="Tutar (TL)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              <Button data-testid="button-add-debt" variant="destructive" onClick={() => addTransaction(true)}>Borç Ekle (+)</Button>
              <Button data-testid="button-add-credit" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => addTransaction(false)}>Tahsilat Ekle (-)</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex justify-between items-center">
              <span>İşlem Geçmişi</span>
              <Button data-testid="button-download-statement" size="sm" variant="outline" onClick={() => generateCustomerStatement(customer.name, customer.transactions)}>
                📄 Ekstreyi PDF Olarak İndir
              </Button>
            </h3>
            <div className="space-y-2">
              {customer.transactions.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-border rounded bg-card">
                  <div className="flex flex-col">
                    <span className="font-medium">{t.note || '-'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.amount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {t.amount > 0 ? '+' : ''}{t.amount} TL
                    </span>
                    <Button data-testid={`button-delete-transaction-${idx}`} variant="ghost" size="icon" onClick={() => deleteTransaction(idx)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {customer.transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">İşlem bulunamadı.</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border mt-auto">
          <Button data-testid="button-delete-customer" variant="destructive" className="w-full" onClick={() => { onDelete(customer.name); onOpenChange(false); }}>
            Müşteriyi Tamamen Sil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
