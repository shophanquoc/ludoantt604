import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";

export default function EditLeader() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [years, setYears] = useState("");
  const [info, setInfo] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("leaders").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setRole(data.role);
          setYears(data.years || "");
          setInfo(data.info || "");
          setAvatar(data.avatar || "");
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `avatars/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) { toast({ title: "Lỗi upload", description: error.message, variant: "destructive" }); return; }
    const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
    setAvatar(publicUrl);
  };

  const handleSave = async () => {
    if (!name.trim() || !role.trim()) { toast({ title: "Vui lòng nhập họ tên và chức vụ", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { name, role, years: years || null, info: info || null, avatar: avatar || null };
    const { error } = isNew
      ? await supabase.from("leaders").insert(payload)
      : await supabase.from("leaders").update(payload).eq("id", id!);
    setSaving(false);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); }
    else { toast({ title: isNew ? "Đã thêm lãnh đạo" : "Đã cập nhật" }); navigate("/admin/leaders"); }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/leaders")}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold">{isNew ? "Thêm lãnh đạo" : "Chỉnh sửa lãnh đạo"}</h2>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Họ tên</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ tên" />
          </div>
          <div className="space-y-2">
            <Label>Chức vụ</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="VD: Lữ đoàn trưởng" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Nhiệm kỳ</Label>
          <Input value={years} onChange={(e) => setYears(e.target.value)} placeholder="VD: 1975-1980" />
        </div>
        <div className="space-y-2">
          <Label>Ảnh đại diện</Label>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-accent">
              <Upload className="h-4 w-4" />Chọn ảnh
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            {avatar && <img src={avatar} alt="avatar" className="h-16 w-16 rounded-full object-cover" />}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Thông tin thêm</Label>
          <Textarea value={info} onChange={(e) => setInfo(e.target.value)} placeholder="VD: Sinh 1945 - Quê Hà Nội" rows={3} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
          <Button variant="outline" onClick={() => navigate("/admin/leaders")}>Hủy</Button>
        </div>
      </div>
    </div>
  );
}
