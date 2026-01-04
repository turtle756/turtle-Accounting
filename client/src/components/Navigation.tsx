import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  FileBarChart,
  Menu,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { path: "/", label: "대시보드", icon: LayoutDashboard },
  { path: "/input", label: "입력", icon: PlusCircle },
  { path: "/income", label: "수입", icon: ArrowUpRight },
  { path: "/expense", label: "지출", icon: ArrowDownRight },
  { path: "/budget", label: "예산", icon: Wallet },
  { path: "/reports", label: "보고서", icon: FileBarChart },
];

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "";
    return location === path;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-background border-b z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">교회 회계</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                  data-testid={`nav-${item.label}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Settings */}
          <Link href="/settings">
            <Button
              variant={isActive("/settings") ? "secondary" : "ghost"}
              size="icon"
              data-testid="nav-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-50">
        <div className="px-4 flex items-center justify-between gap-4 h-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">교회 회계</span>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      data-testid={`nav-mobile-${item.label}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t my-4" />
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive("/settings") ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    data-testid="nav-mobile-settings"
                  >
                    <Settings className="w-5 h-5" />
                    설정
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-full">
          {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[5]].map((item) => (
            <Link key={item.path} href={item.path} className="flex-1">
              <div
                className={`flex flex-col items-center justify-center gap-1 py-2 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-bottom-${item.label}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-14" />
    </>
  );
}
