import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload } from "lucide-react";

export default function EditArticle() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("articles").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setCategory(data.category || "");
          setContent(data.content);
          setImage(data.image || "");
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `headers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) {
      toast({ title: "Lỗi upload", description: error.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
    setImage(publicUrl);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Vui lòng nhập tiêu đề", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { title, content, image: image || null, category: category || null };

    const { error } = isNew
      ? await supabase.from("articles").insert(payload)
      : await supabase.from("articles").update(payload).eq("id", id!);

    setSaving(false);
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isNew ? "Đã tạo bài viết" : "Đã cập nhật" });
      navigate("/admin");
    }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{isNew ? "Thêm bài viết" : "Chỉnh sửa bài viết"}</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tiêu đề</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề" />
        </div>

        <div className="space-y-2">
          <Label>Năm (category)</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="VD: 2024" />
        </div>

        <div className="space-y-2">
          <Label>Ảnh tiêu đề</Label>
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-accent">
              <Upload className="h-4 w-4" />
              Chọn ảnh
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && <img src={image} alt="preview" className="h-16 rounded-md object-cover" />}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nội dung (có thể dán ảnh vào giữa bài)</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>Hủy</Button>
        </div>
      </div>
    </div>
  );
}
