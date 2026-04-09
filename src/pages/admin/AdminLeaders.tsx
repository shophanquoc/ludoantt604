import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminLeaders() {
  const [items, setItems] = useState<Tables<"leaders">[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase.from("leaders").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("leaders").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa lãnh đạo" });
      fetchItems();
    }
    setDeleteId(null);
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lãnh đạo qua các thời kỳ</h2>
        <Button asChild size="sm">
          <Link to="/admin/leaders/new"><Plus className="mr-1 h-4 w-4" />Thêm mới</Link>
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role} · {item.years}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link to={`/admin/leaders/${item.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead className="w-28">Nhiệm kỳ</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.years}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/admin/leaders/${item.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có dữ liệu</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc chắn muốn xóa lãnh đạo này?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
