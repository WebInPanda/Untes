import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Package, ShoppingCart, History, FileText, Menu, X } from "lucide-react";

import Musteriler from "./pages/Musteriler";
import Urunler from "./pages/Urunler";
import Sepet from "./pages/Sepet";
import SatisGecmisi from "./pages/SatisGecmisi";
import TeklifFormu from "./pages/TeklifFormu";
import NotFound from "./pages/not-found";
import Calculator from "./components/Calculator";

function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/musteriler", icon: Users, label: "Müşteriler", testId: "link-nav-musteriler" },
    { href: "/urunler", icon: Package, label: "Ürünler", testId: "link-nav-urunler" },
    { href: "/sepet", icon: ShoppingCart, label: "Satış / Sepet", testId: "link-nav-sepet" },
    { href: "/gecmis", icon: History, label: "Satış Geçmişi", testId: "link-nav-gecmis" },
    { href: "/teklif", icon: FileText, label: "Teklif Formu", testId: "link-nav-teklif" }
  ];

  return (
    <div className="flex flex-col w-72 lg:w-64 border-r border-border bg-card p-4 gap-4 h-full">
      <div className="flex items-center gap-2 mb-8 text-primary">
        <LayoutDashboard size={24} />
        <h1 className="font-bold text-xl">Satış Yönetimi</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/musteriler");
          return (
            <Link key={item.href} href={item.href} onClick={onLinkClick}>
              <div data-testid={item.testId} className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background dark">
      <div className="lg:hidden border-b border-border bg-card p-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-primary">
          <LayoutDashboard size={24} />
          <h1 className="font-bold text-lg">Satış Yönetimi</h1>
        </div>
        <button
          type="button"
          aria-label="Menüyü aç"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md border border-border text-foreground hover:bg-muted"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          {children}
          <Calculator />
        </main>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
        <div className="relative z-10 w-72 max-w-full h-full bg-card border-r border-border p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-primary">
              <LayoutDashboard size={24} />
              <span className="font-bold text-lg">Menü</span>
            </div>
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md border border-border text-foreground hover:bg-muted"
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar onLinkClick={() => setSidebarOpen(false)} />
        </div>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, "") : ""}>
        <Layout>
          <Switch>
            <Route path="/" component={Musteriler} />
            <Route path="/musteriler" component={Musteriler} />
            <Route path="/urunler" component={Urunler} />
            <Route path="/sepet" component={Sepet} />
            <Route path="/gecmis" component={SatisGecmisi} />
            <Route path="/teklif" component={TeklifFormu} />
            <Route path="*" component={NotFound} />
          </Switch>
        </Layout>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
