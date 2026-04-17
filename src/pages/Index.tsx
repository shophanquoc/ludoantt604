import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Hero from "@/components/layout/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, ArrowRight, CalendarDays, Newspaper, RefreshCw } from "lucide-react";

type Article = Tables<"articles">;
type Activity = Tables<"activities">;
type Leader = Tables<"leaders">;

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));

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

  const [articles, setArticles] = useState<Article[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Hide pinned history article from "regular" article lists
  const visibleArticles = useMemo(
    () => articles.filter((article) => article.slug !== "lich-su"),
    [articles],
  );

  const featuredArticle = visibleArticles[0] || null;
  const currentArticle = useMemo(
    () => articles.find((article) => article.id === id) || null,
    [articles, id],
  );

  const isArticlePage = location.pathname.startsWith("/article/");
  const isActivitiesPage = location.pathname === "/activities";
  const isLeadersPage = location.pathname === "/leaders";
  const isNewsPage = location.pathname === "/tin-tuc";
  const isHome = !isArticlePage && !isActivitiesPage && !isLeadersPage && !isNewsPage;

  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="overflow-hidden border-border/80 transition-shadow hover:shadow-md">
      {article.image && (
        <Link to={`/article/${article.id}`} className="block">
          <img src={article.image} alt={article.title} className="h-48 w-full object-cover" loading="lazy" />
        </Link>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{article.category || "Tin tức"}</Badge>
          <span>{formatDate(article.created_at)}</span>
        </div>
        <CardTitle className="font-display text-xl leading-snug">
          <Link to={`/article/${article.id}`} className="hover:text-primary">
            {article.title}
          </Link>
        </CardTitle>
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
        <CardTitle className="font-display text-lg leading-snug">{activity.title}</CardTitle>
        <CardDescription>
          {stripHtml(activity.content).slice(0, 160) || "Chưa có mô tả hoạt động."}
        </CardDescription>
      </CardHeader>
    </Card>
  );

  const renderLeaderCard = (leader: Leader) => (
    <Card key={leader.id} className="border-border/80">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={leader.avatar || undefined} alt={leader.name} className="object-cover" />
          <AvatarFallback>{getInitials(leader.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <CardTitle className="font-display text-lg">{leader.name}</CardTitle>
          <CardDescription>
            <span className="block font-medium text-foreground">{leader.role}</span>
            <span>{leader.years || "Chưa cập nhật nhiệm kỳ"}</span>
          </CardDescription>
        </div>
      </CardHeader>
      {leader.info && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{stripHtml(leader.info).slice(0, 180)}</p>
        </CardContent>
      )}
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
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {isHome && <Hero />}

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
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

          {isArticlePage ? (
            <section className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại
              </Button>
              {loading ? (
                renderLoading()
              ) : currentArticle ? (
                <article className="space-y-6">
                  {currentArticle.image && (
                    <img
                      src={currentArticle.image}
                      alt={currentArticle.title}
                      className="max-h-[460px] w-full rounded-3xl object-cover"
                    />
                  )}
                  <div className="space-y-3">
                    <Badge variant="outline">{currentArticle.category || "Bài viết"}</Badge>
                    <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                      {currentArticle.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Cập nhật ngày {formatDate(currentArticle.created_at)}
                    </p>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      <div
                        className="space-y-4 text-sm leading-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_img]:my-4 [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{
                          __html: currentArticle.content || "<p>Chưa có nội dung.</p>",
                        }}
                      />
                    </CardContent>
                  </Card>
                </article>
              ) : (
                renderEmpty("Không tìm thấy bài viết", "Bài viết này có thể đã bị xoá hoặc chưa được tải về.")
              )}
            </section>
          ) : isNewsPage ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline">Tin tức</Badge>
                <h1 className="font-display text-3xl font-bold tracking-tight">Bản tin đơn vị</h1>
                <p className="text-muted-foreground">Tổng hợp tin tức mới nhất từ Lữ đoàn.</p>
              </div>
              {loading
                ? renderLoading()
                : visibleArticles.length
                  ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleArticles.map(renderArticleCard)}</div>
                  : renderEmpty("Chưa có bài viết", "Tin tức sẽ được cập nhật tại đây.")}
            </section>
          ) : isActivitiesPage ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline">Hoạt động</Badge>
                <h1 className="font-display text-3xl font-bold tracking-tight">Danh sách hoạt động</h1>
                <p className="text-muted-foreground">Tổng hợp các hoạt động mới nhất.</p>
              </div>
              {loading
                ? renderLoading()
                : activities.length
                  ? <div className="grid gap-4 md:grid-cols-2">{activities.map(renderActivityCard)}</div>
                  : renderEmpty("Chưa có hoạt động", "Khi quản trị viên thêm hoạt động mới, danh sách sẽ cập nhật tại đây.")}
            </section>
          ) : isLeadersPage ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline">Lãnh đạo đơn vị</Badge>
                <h1 className="font-display text-3xl font-bold tracking-tight">Lãnh đạo qua từng thời kỳ</h1>
                <p className="text-muted-foreground">Hồ sơ lãnh đạo qua từng thời kỳ.</p>
              </div>
              {loading
                ? renderLoading()
                : leaders.length
                  ? <div className="grid gap-4 md:grid-cols-2">{leaders.map(renderLeaderCard)}</div>
                  : renderEmpty("Chưa có dữ liệu lãnh đạo", "Bạn có thể thêm hồ sơ lãnh đạo từ trang quản trị.")}
            </section>
          ) : (
            <div className="space-y-12">
              {/* Featured news */}
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-tight">Tin tức nổi bật</h2>
                    <p className="text-sm text-muted-foreground">Các bài viết mới được cập nhật từ hệ thống.</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/tin-tuc">
                      Xem tất cả <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {loading ? (
                  renderLoading()
                ) : visibleArticles.length ? (
                  <>
                    {featuredArticle && (
                      <Card className="overflow-hidden border-border/80">
                        <div className="grid md:grid-cols-2">
                          {featuredArticle.image ? (
                            <Link to={`/article/${featuredArticle.id}`}>
                              <img
                                src={featuredArticle.image}
                                alt={featuredArticle.title}
                                className="h-full max-h-80 w-full object-cover"
                              />
                            </Link>
                          ) : (
                            <div className="flex min-h-[16rem] items-center justify-center bg-muted">
                              <Newspaper className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex flex-col justify-center p-6 md:p-8">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{featuredArticle.category || "Tin tức"}</Badge>
                              <span>{formatDate(featuredArticle.created_at)}</span>
                            </div>
                            <h3 className="mt-3 font-display text-2xl font-semibold leading-snug md:text-3xl">
                              <Link to={`/article/${featuredArticle.id}`} className="hover:text-primary">
                                {featuredArticle.title}
                              </Link>
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                              {stripHtml(featuredArticle.content).slice(0, 220) || "Chưa có nội dung tóm tắt."}
                            </p>
                            <div className="mt-5">
                              <Button asChild>
                                <Link to={`/article/${featuredArticle.id}`}>
                                  Đọc bài viết <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visibleArticles.slice(1, 7).map(renderArticleCard)}
                    </div>
                  </>
                ) : (
                  renderEmpty("Chưa có bài viết", "Hiện chưa có bài viết nào được xuất bản.")
                )}
              </section>

              <section className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Hoạt động gần đây</h2>
                    <p className="text-sm text-muted-foreground">Theo dõi các hoạt động mới nhất.</p>
                  </div>
                  {loading
                    ? renderLoading()
                    : activities.length
                      ? activities.slice(0, 3).map(renderActivityCard)
                      : renderEmpty("Chưa có hoạt động", "Danh sách hoạt động đang trống.")}
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Lãnh đạo</h2>
                    <p className="text-sm text-muted-foreground">Lãnh đạo đơn vị qua từng thời kỳ.</p>
                  </div>
                  {loading
                    ? renderLoading()
                    : leaders.length
                      ? leaders.slice(0, 3).map(renderLeaderCard)
                      : renderEmpty("Chưa có dữ liệu", "Hồ sơ lãnh đạo sẽ hiển thị tại đây.")}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
};

export default Index;
