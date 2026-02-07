import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, Plus, Edit2, Trash2, MoreHorizontal, ArrowUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContent, Article } from "@/lib/content-context";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "@/components/ui/skeleton";

export function WritingTab() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { articles, updateArticle, deleteArticle, isLoading } = useContent();

  const [articleStatusFilter, setArticleStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [filterQuery, setFilterQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  const [toggleArticle, setToggleArticle] = useState<Article | null>(null);

  const draftArticlesCount = useMemo(() =>
    articles.filter(a => a.status === "Draft").length,
    [articles]
  );
  const publishedArticlesCount = useMemo(() =>
    articles.filter(a => a.status === "Published").length,
    [articles]
  );

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (articleStatusFilter === "draft") {
      result = result.filter(article => article.status === "Draft");
    } else if (articleStatusFilter === "published") {
      result = result.filter(article => article.status === "Published");
    }

    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      result = result.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        (article.tags && article.tags.toLowerCase().includes(query)) ||
        (article.seoKeywords && article.seoKeywords.toLowerCase().includes(query))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key] || "";
        const bValue = (b as any)[sortConfig.key] || "";

        if (sortConfig.key === 'views') {
             const aNum = parseInt(aValue.toString().replace(/[^0-9]/g, '')) || 0;
             const bNum = parseInt(bValue.toString().replace(/[^0-9]/g, '')) || 0;
             return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [articles, articleStatusFilter, filterQuery, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditPost = (article: Article) => {
    setLocation(`/admin/article/${article.id}`);
  };

  const canPublishArticle = (article: Article) => {
    return article.slug?.trim() !== '' && article.title?.trim() !== '';
  };

  const handleToggleRequest = (article: Article) => {
    if (article.status === "Draft" && !canPublishArticle(article)) {
      toast({
        title: "Cannot Publish",
        description: "Article must have a title and slug before publishing.",
        variant: "destructive"
      });
      return;
    }
    setToggleArticle(article);
  };

  const confirmToggleStatus = async () => {
    if (!toggleArticle) return;
    const newStatus = toggleArticle.status === "Published" ? "Draft" : "Published";
    try {
      await updateArticle(toggleArticle.id, { status: newStatus });
      toast({
        title: `Article ${newStatus}`,
        description: `"${toggleArticle.title}" is now ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating article status:", error);
      toast({ title: "Error", description: "Failed to update article status.", variant: "destructive" });
    } finally {
      setToggleArticle(null);
    }
  };

  const handleDeleteArticle = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteArticleId(id);
  };

  const confirmDeleteArticle = async () => {
    if (deleteArticleId === null) return;
    try {
      await deleteArticle(deleteArticleId);
      toast({ title: "Article Deleted", description: "The article has been permanently removed.", variant: "destructive" });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({ title: "Error", description: "Failed to delete article. Please try again.", variant: "destructive" });
    } finally {
      setDeleteArticleId(null);
    }
  };

  const getWordCount = (content: string) => {
    const text = content.replace(/<[^>]*>?/gm, '');
    return text.split(/\s+/).filter(Boolean).length;
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = getWordCount(content);
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-300">
        <div className="hidden md:block mb-6">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <Skeleton className="h-9 w-full md:w-64" />
          <Skeleton className="h-9 w-full md:w-32" />
        </div>
        <Skeleton className="h-9 w-72 mb-4" />
        <div className="border rounded-md bg-background overflow-hidden">
          <div className="bg-muted/50 px-4 py-3">
            <div className="flex gap-8">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-4 w-20" />)}
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-t">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="hidden md:block mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Writing</h2>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Filter by tags or keywords..."
                className="pl-8 h-9 text-sm"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
            />
        </div>
        <Button onClick={() => setLocation("/admin/article/new")} size="sm" className="gap-2 h-9 shadow-none w-full md:w-auto"><Plus className="h-4 w-4" /> New Article</Button>
      </div>

      <Tabs value={articleStatusFilter} onValueChange={(value) => setArticleStatusFilter(value as "all" | "draft" | "published")} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-articles">
            All ({articles.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft-articles">
            Drafts ({draftArticlesCount})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published-articles">
            Published ({publishedArticlesCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-md bg-background overflow-hidden min-w-0">
        <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[300px] cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                        <div className="flex items-center gap-1">
                            Title {sortConfig?.key === 'title' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('seoKeywords')}>
                        <div className="flex items-center gap-1">
                            SEO Keywords {sortConfig?.key === 'seoKeywords' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('tags')}>
                        <div className="flex items-center gap-1">
                            Tags {sortConfig?.key === 'tags' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Word Count</TableHead>
                    <TableHead className="whitespace-nowrap">Read Time</TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground text-right" onClick={() => handleSort('views')}>
                        <div className="flex items-center justify-end gap-1">
                            Views {sortConfig?.key === 'views' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('publishedAt')}>
                        <div className="flex items-center gap-1">
                            Published Date {sortConfig?.key === 'publishedAt' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="w-[80px] text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                        <div className="flex items-center justify-center gap-1">
                            Published {sortConfig?.key === 'status' && <ArrowUpDown className="h-3 w-3" />}
                        </div>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredArticles.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            No results found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredArticles.map((article) => (
                        <TableRow
                            key={article.id}
                            className="group cursor-pointer hover:bg-muted/30"
                            onClick={() => handleEditPost(article)}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-secondary/50 flex items-center justify-center text-[10px] text-muted-foreground">
                                        📄
                                    </div>
                                    <span className="truncate max-w-[250px]">{article.title || "Untitled"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                {article.seoKeywords || "—"}
                            </TableCell>
                            <TableCell className="text-xs">
                                {article.tags ? (
                                    <Badge variant="secondary" className="text-[10px] font-normal h-5">
                                        {article.tags.split(',')[0]}
                                        {article.tags.split(',').length > 1 && ` +${article.tags.split(',').length - 1}`}
                                    </Badge>
                                ) : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                {getWordCount(article.content).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {getReadingTime(article.content)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-mono">
                                {article.views}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                            </TableCell>
                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={article.status === "Published"}
                                    disabled={article.status === "Draft" && !canPublishArticle(article)}
                                    onCheckedChange={() => handleToggleRequest(article)}
                                    data-testid={`checkbox-publish-${article.id}`}
                                />
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditPost(article); }}>
                                            <Edit2 className="mr-2 h-3 w-3" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteArticle(article.id, e)}>
                                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteArticleId !== null} onOpenChange={(open) => { if (!open) setDeleteArticleId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteArticle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish/Unpublish Confirmation Dialog */}
      <AlertDialog open={toggleArticle !== null} onOpenChange={(open) => { if (!open) setToggleArticle(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleArticle?.status === "Published" ? "Unpublish Article" : "Publish Article"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleArticle?.status === "Published"
                ? `"${toggleArticle?.title}" will be reverted to draft and no longer visible to readers.`
                : `"${toggleArticle?.title}" will be published and visible to all readers.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {toggleArticle?.status === "Published" ? "Unpublish" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
