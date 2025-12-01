import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";

const Categories = () => {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Categories</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", category.color || "bg-primary")}>
                  <span className="text-2xl">
                    {(() => {
                      const emojis: Record<string, string> = {
                        'Automotive': '🏎️',
                        'Books & Media': '📚',
                        'Electronics': '💻',
                        'Fashion': '🛍️',
                        'Health & Beauty': '👨‍⚕️',
                        'Home & Garden': '🏡',
                        'Sports & Outdoors': '🏋️',
                        'Toys & Games': '🎮'
                      };
                      return emojis[category.name] || '📦';
                    })()}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">View items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Categories;