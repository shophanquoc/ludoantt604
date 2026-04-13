import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TabType = "articles" | "activities" | "leaders";

const Admin = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("articles");
  const [data, setData] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/login");
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const { data: rows } = await supabase
      .from(activeTab)
      .select("*")
      .order("created_at", { ascending: false });
    setData(rows || []);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from(activeTab).delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa thành công" });
      fetchData();
    }
    setDeleteId(null);
  };

  const getColumns = (): { key: string; label: string }[] => {
    if (activeTab === "articles") return [{ key: "title", label: "Tiêu đề" }, { key: "category", label: "Danh mục" }];
    if (activeTab === "activities") return [{ key: "title", label: "Tiêu đề" }];
    return [{ key: "name", label: "Họ tên" }, { key: "role", label: "Chức vụ" }, { key: "years", label: "Nhiệm kỳ" }];
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Đang tải...</div>;
  if (!isAdmin) return null;

  const tabLabels: Record<TabType, string> = { articles: "Bài viết", activities: "Hoạt động", leaders: "Lãnh đạo" };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-bold">Quản trị</h1>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="mr-1.5 h-4 w-4" /> Thoát
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto">
              {(Object.keys(tabLabels) as TabType[]).map((tab) => (
                <TabsTrigger key={tab} value={tab} className="flex-1 sm:flex-none">{tabLabels[tab]}</TabsTrigger>
              ))}
            </TabsList>
            <Button size="sm" onClick={() => navigate(`/admin/${activeTab}/new`)}>
              <Plus className="mr-1.5 h-4 w-4" /> Thêm mới
            </Button>
          </div>

          {(Object.keys(tabLabels) as TabType[]).map((tab) => (
            <TabsContent key={tab} value={tab}>
              {/* Mobile cards */}
              <div className="space-y-2 sm:hidden">
                {data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title || item.name}</p>
                      {tab === "articles" && <p className="text-xs text-muted-foreground">{item.category || "—"}</p>}
                      {tab === "leaders" && <p className="text-xs text-muted-foreground">{item.role}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/${tab}/${item.id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getColumns().map((col) => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                      <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => (
                      <TableRow key={item.id}>
                        {getColumns().map((col) => (
                          <TableCell key={col.key}>{item[col.key] || "—"}</TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/${tab}/${item.id}`)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={getColumns().length + 1} className="text-center text-muted-foreground py-8">
                          Chưa có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
