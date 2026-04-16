import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  CalendarDays,
  Home,
  Loader2,
  LogIn,
  Menu,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

type Article = Tables<"articles">;
type Activity = Tables<"activities">;
type Leader = Tables<"leaders">;

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const Index = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    const [articlesResult, activitiesResult, leadersResult] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("activities").select("*").order("created_at", { ascending: false }),
      supabase.from("leaders").select("*").order("created_at", { ascending: false }),
    ]);

    setArticles(articlesResult.data || []);
    setActivities(activitiesResult.data || []);
    setLeaders(leadersResult.data || []);

    const errors = [articlesResult.error, activitiesResult.error, leadersResult.error]
      .filter(Boolean)
      .map((item) => item?.message)
      .join(" · ");

    setError(errors || null);
    setLoading(false);
  };

  useEffect(() => {
    void loadContent();
  }, []);

  const featuredArticle = articles[0] || null;
  const currentArticle = useMemo(() => articles.find((article) => article.id === id) || null, [articles, id]);
  const isArticlePage = location.pathname.startsWith("/article/");
  const isActivitiesPage = location.pathname === "/activities";
  const isLeadersPage = location.pathname === "/leaders";

  const navigationItems = [
    { label: "Trang chủ", to: "/", icon: Home },
    { label: "Hoạt động", to: "/activities", icon: CalendarDays },
    { label: "Lãnh đạo", to: "/leaders", icon: Users },
  ];

  const openAdminLogin = () => {
    setSidebarOpen(false);
    navigate(isAdmin ? "/admin" : "/admin/login");
  };

  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="overflow-hidden border-border/80">
      {article.image && <img src={article.image} alt={article.title} className="h-48 w-full object-cover" loading="lazy" />}
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{article.category || "Tin tức"}</Badge>
          <span>{formatDate(article.created_at)}</span>
        </div>
        <CardTitle className="text-xl">{article.title}</CardTitle>
        <CardDescription>{stripHtml(article.content).slice(0, 140) || "Chưa có nội dung tóm tắt."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to={`/article/${article.id}`}>
            Xem chi tiết <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const renderActivityCard = (activity: Activity) => (
    <Card key={activity.id} className="border-border/80">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatDate(activity.created_at)}</span>
        </div>
        <CardTitle className="text-lg">{activity.title}</CardTitle>
        <CardDescription>{stripHtml(activity.content).slice(0, 160) || "Chưa có mô tả hoạt động."}</CardDescription>
      </CardHeader>
    </Card>
  );

  const renderLeaderCard = (leader: Leader) => (
    <Card key={leader.id} className="border-border/80">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={leader.avatar || undefined} alt={leader.name} />
          <AvatarFallback>{getInitials(leader.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <CardTitle className="text-lg">{leader.name}</CardTitle>
          <CardDescription>
            <span className="block font-medium text-foreground">{leader.role}</span>
            <span>{leader.years || "Chưa cập nhật nhiệm kỳ"}</span>
          </CardDescription>
        </div>
      </CardHeader>
      {leader.info && <CardContent><p className="text-sm text-muted-foreground">{stripHtml(leader.info).slice(0, 180)}</p></CardContent>}
    </Card>
  );

  const renderLoading = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="h-48 w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmpty = (title: string, description: string) => (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button className="text-left" onClick={() => navigate("/")}>
            <p className="text-lg font-semibold">Lữ đoàn Thông tin 604</p>
            <p className="text-sm text-muted-foreground">Trang thông tin nội dung</p>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors"
                activeClassName="bg-muted text-foreground"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button onClick={openAdminLogin}>
              {isAdmin ? "Vào quản trị" : "Đăng nhập admin"}
            </Button>
          </div>

          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="flex h-full flex-col">
                <div className="p-6">
                  <p className="text-lg font-semibold">Lữ đoàn Thông tin 604 - QK2</p>
                  <p className="text-sm text-muted-foreground">Trang thông tin nội dung và lịch sử hình thành</p>
                </div>
                <Separator />
                <div className="flex-1 space-y-2 p-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        onClick={() => {
                          setSidebarOpen(false);
                          navigate(item.to);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t p-4">
                  <Button className="w-full" onClick={openAdminLogin}>
                    <LogIn className="mr-2 h-4 w-4" /> {isAdmin ? "Vào quản trị" : "Đăng nhập admin"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Đang có lỗi tải dữ liệu</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadContent}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tải lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isArticlePage && !isActivitiesPage && !isLeadersPage && (
          <section className="grid gap-6 rounded-3xl border bg-gradient-to-br from-background to-muted/60 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div className="space-y-4">
              <Badge variant="outline">Trang chủ</Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Tin tức và hoạt động đơn vị.</h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Lữ đoàn Thông tin 604 tiền thân là Trung đoàn Thông tin 604, được thành lập ngày 9-9-1978, tại xã An Tường, huyện Yên Sơn, tỉnh Hà Tuyên (nay thuộc Phường An Tường, thành phố Tuyên Quang, tỉnh Tuyên Quang), là đơn vị binh chủng, bảo đảm thông tin liên lạc phục vụ Đảng ủy, Bộ tư lệnh Quân khu lãnh đạo, chỉ huy, chỉ đạo các cơ quan, đơn vị trong LLVT Quân khu 2 thực hiện nhiệm vụ quân sự, quốc phòng và liên lạc với cấp trên.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/activities">Xem hoạt động</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/leaders">Xem lãnh đạo </Link>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden border-border/80">
              {featuredArticle?.image ? (
                <img src={featuredArticle.image} alt={featuredArticle.title} className="h-56 w-full object-cover" loading="eager" />
              ) : (
                <div className="flex h-56 items-center justify-center bg-muted">
                  <Newspaper className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardDescription>Tin nổi bật</CardDescription>
                <CardTitle>{featuredArticle?.title || "Chưa có bài viết nổi bật"}</CardTitle>
                <CardDescription>
                  {featuredArticle ? stripHtml(featuredArticle.content).slice(0, 140) : "Khi có bài viết mới, nội dung sẽ xuất hiện ngay tại đây."}
                </CardDescription>
              </CardHeader>
              {featuredArticle && (
                <CardContent>
                  <Button asChild variant="outline">
                    <Link to={`/article/${featuredArticle.id}`}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          </section>
        )}

        {isArticlePage ? (
          <section className="space-y-6">
            <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            {loading ? (
              renderLoading()
            ) : currentArticle ? (
              <article className="space-y-6">
                {currentArticle.image && (
                  <img src={currentArticle.image} alt={currentArticle.title} className="max-h-[460px] w-full rounded-3xl object-cover" />
                )}
                <div className="space-y-3">
                  <Badge variant="outline">{currentArticle.category || "Bài viết"}</Badge>
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{currentArticle.title}</h1>
                  <p className="text-sm text-muted-foreground">Cập nhật ngày {formatDate(currentArticle.created_at)}</p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div
                      className="space-y-4 text-sm leading-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_img]:rounded-xl [&_img]:my-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: currentArticle.content || "<p>Chưa có nội dung.</p>" }}
                    />
                  </CardContent>
                </Card>
              </article>
            ) : (
              renderEmpty("Không tìm thấy bài viết", "Bài viết này có thể đã bị xoá hoặc chưa được tải về.")
            )}
          </section>
        ) : isActivitiesPage ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline">Hoạt động</Badge>
              <h1 className="text-3xl font-semibold tracking-tight">Danh sách hoạt động</h1>
              <p className="text-muted-foreground">Tổng hợp các hoạt động mới nhất, hiển thị rõ ràng kể cả khi chưa có dữ liệu.</p>
            </div>
            {loading ? renderLoading() : activities.length ? <div className="grid gap-4 md:grid-cols-2">{activities.map(renderActivityCard)}</div> : renderEmpty("Chưa có hoạt động", "Khi quản trị viên thêm hoạt động mới, danh sách sẽ cập nhật tại đây.")}
          </section>
        ) : isLeadersPage ? (
          <section className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline">Lãnh đạo đơn vị</Badge>
              <h1 className="text-3xl font-semibold tracking-tight">Lãnh đạo qua từng thời kỳ</h1>
              <p className="text-muted-foreground">Hiển thị hồ sơ lãnh đạo qua từng thời kỳ từ dữ liệu quản trị.</p>
            </div>
            {loading ? renderLoading() : leaders.length ? <div className="grid gap-4 md:grid-cols-2">{leaders.map(renderLeaderCard)}</div> : renderEmpty("Chưa có dữ liệu lãnh đạo", "Bạn có thể thêm hồ sơ lãnh đạo từ trang quản trị.")}
          </section>
        ) : (
          <div className="mt-8 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Bài viết mới</h2>
                  <p className="text-sm text-muted-foreground">Tin tức được đồng bộ trực tiếp từ hệ thống quản trị.</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/activities">Xem hoạt động</Link>
                </Button>
              </div>
              {loading ? renderLoading() : articles.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{articles.slice(0, 6).map(renderArticleCard)}</div> : renderEmpty("Chưa có bài viết", "Hiện chưa có bài viết nào được xuất bản.")}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Hoạt động gần đây</h2>
                  <p className="text-sm text-muted-foreground">Theo dõi các hoạt động mới nhất của đơn vị.</p>
                </div>
                {loading ? renderLoading() : activities.length ? activities.slice(0, 3).map(renderActivityCard) : renderEmpty("Chưa có hoạt động", "Danh sách hoạt động đang trống.")}
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Lãnh đạo</h2>
                  <p className="text-sm text-muted-foreground">Lãnh đạo qua từng thời kỳ.</p>
                </div>
                {loading ? renderLoading() : leaders.length ? leaders.slice(0, 4).map(renderLeaderCard) : renderEmpty("Chưa có hồ sơ lãnh đạo", "Hãy cập nhật hồ sơ lãnh đạo trong trang quản trị.")}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Lữ đoàn Thông tin 604</p>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Copyright 2026. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
