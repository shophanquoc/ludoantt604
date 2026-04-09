import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Bài viết", end: true },
  { to: "/admin/activities", label: "Hoạt động" },
  { to: "/admin/leaders", label: "Lãnh đạo" },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive font-medium">Bạn không có quyền truy cập trang quản trị.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-sm font-semibold sm:text-base">Quản trị Lữ đoàn 604</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden border-t md:block">
          <div className="flex gap-1 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t bg-background md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 text-sm font-medium",
                    isActive ? "bg-accent text-primary" : "text-muted-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
