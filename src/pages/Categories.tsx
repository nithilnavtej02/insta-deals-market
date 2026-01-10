import React, { useState } from "react";
import { ArrowLeft, Search, Grid3X3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";

const Categories = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { categories, loading } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryEmojis: Record<string, string> = {
    'Automotive': '🏎️',
    'Books & Media': '📚',
    'Electronics': '💻',
    'Fashion': '👗',
    'Health & Beauty': '💄',
    'Home & Garden': '🏡',
    'Sports & Outdoors': '⚽',
    'Toys & Games': '🎮',
    'Jewelry': '💎',
    'Art': '🎨',
    'Music': '🎵',
    'Collectibles': '🏆'
  };

  const categoryColors: Record<string, string> = {
    'Automotive': 'from-red-500 to-orange-500',
    'Books & Media': 'from-blue-500 to-indigo-500',
    'Electronics': 'from-purple-500 to-pink-500',
    'Fashion': 'from-pink-500 to-rose-500',
    'Health & Beauty': 'from-green-500 to-emerald-500',
    'Home & Garden': 'from-amber-500 to-yellow-500',
    'Sports & Outdoors': 'from-cyan-500 to-blue-500',
    'Toys & Games': 'from-violet-500 to-purple-500',
    'Jewelry': 'from-yellow-500 to-amber-500',
    'Art': 'from-rose-500 to-red-500',
    'Music': 'from-indigo-500 to-blue-500',
    'Collectibles': 'from-orange-500 to-red-500'
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Categories</h1>
              <p className="text-xs text-muted-foreground">{categories.length} categories</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-full bg-muted/50 border-0"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="border-0 shadow-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <CardContent className="p-0">
                  <div className={`h-24 bg-gradient-to-br ${categoryColors[category.name] || 'from-primary to-primary/60'} flex items-center justify-center`}>
                    <span className="text-4xl">{categoryEmojis[category.name] || '📦'}</span>
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">View items</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Grid3X3 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Categories</h1>
              <p className="text-sm text-muted-foreground">Browse by category</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-full bg-muted/50 border-0"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
              onClick={() => navigate(`/categories/${category.id}`)}
            >
              <CardContent className="p-0">
                <div className={`h-32 bg-gradient-to-br ${categoryColors[category.name] || 'from-primary to-primary/60'} flex items-center justify-center`}>
                  <span className="text-5xl">{categoryEmojis[category.name] || '📦'}</span>
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">View all items →</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Grid3X3 className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No categories found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Categories;