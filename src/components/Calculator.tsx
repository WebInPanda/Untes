import React, { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Calculator() {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  
  const handleKey = (k: string) => {
    if (k === 'C') {
      setExpr('');
    } else if (k === '=') {
      try {
        setExpr(eval(expr).toString());
      } catch (e) {
        setExpr('Error');
      }
    } else {
      setExpr(prev => prev + k);
    }
  };

  const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div data-testid="calculator-widget" className="bg-card border border-border rounded-lg shadow-xl p-4 w-64">
          <div data-testid="calculator-display" className="bg-background text-foreground text-right p-3 rounded mb-4 text-xl overflow-hidden font-mono">
            {expr || '0'}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {keys.map(k => (
              <button 
                key={k} 
                data-testid={`calculator-key-${k}`}
                onClick={() => handleKey(k)}
                className="bg-muted hover:bg-muted/80 text-foreground font-bold p-3 rounded transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}
      <button 
        data-testid="button-toggle-calculator"
        onClick={() => setOpen(!open)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
      >
        <CalcIcon size={24} />
      </button>
    </div>
  );
}
