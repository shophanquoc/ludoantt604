import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, LogIn, Moon, Sun, ShieldCheck, History, Newspaper, CalendarDays, Users, Home, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export const NAV_ITEMS = [
  { label: "Lịch sử lữ đoàn", to: "/lich-su", icon: History },
  { label: "Tin tức", to: "/tin-tuc", icon: Newspaper },
  { label: "Hoạt động", to: "/activities", icon: CalendarDays },
  { label: "Lãnh đạo", to: "/leaders", icon: Users },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    if (q) navigate(`/tin-tuc?q=${encodeURIComponent(q)}`);
  };

  const goAdmin = () => {
    setOpen(false);
    navigate(isAdmin ? "/admin" : "/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-base font-semibold leading-tight">Lữ đoàn 604</p>
            <p className="text-xs text-muted-foreground">Lịch sử & truyền thống</p>
          </div>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeClassName="bg-accent text-foreground"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài viết..."
              className="h-9 w-44 pl-8 lg:w-56"
              aria-label="Tìm kiếm"
            />
          </div>
        </form>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Chuyển chế độ sáng/tối"
          className="hidden md:inline-flex"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto md:ml-0 lg:hidden" aria-label="Mở menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold leading-tight">Lữ đoàn 604</p>
                    <p className="text-xs text-muted-foreground">QK2 - Thông tin</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Đóng">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Separator />

              <form onSubmit={submitSearch} className="p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm bài viết..."
                    className="h-10 pl-8"
                  />
                </div>
              </form>

              <nav className="flex-1 space-y-1 px-3 pb-3">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Home className="h-4 w-4" />
                  Trang chủ
                </button>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        setOpen(false);
                        navigate(item.to);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <Separator />
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>Chế độ tối</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === "dark" ? "Tắt" : "Bật"}
                  </Button>
                </div>
                <Button className="w-full" onClick={goAdmin}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isAdmin ? "Vào quản trị" : "Đăng nhập admin"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default SiteHeader;
