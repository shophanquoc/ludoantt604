import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { LogIn, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      toast({ title: "Đăng nhập thất bại", description: error.message, variant: "destructive" });
    } else {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <CardTitle className="text-center text-2xl">Đăng nhập quản trị</CardTitle>
          <CardDescription className="text-center">
            Dùng tài khoản admin để vào trang quản lý nội dung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!!location.state && (
            <Alert className="mb-4">
              <LogIn className="h-4 w-4" />
              <AlertTitle>Cần đăng nhập</AlertTitle>
              <AlertDescription>Vui lòng đăng nhập tài khoản quản trị để tiếp tục.</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={submitting || loading}>
              {submitting || loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Nếu đăng nhập thành công nhưng vẫn không vào được trang quản trị, hãy kiểm tra tài khoản đã được gán role <strong>admin</strong> chưa.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
