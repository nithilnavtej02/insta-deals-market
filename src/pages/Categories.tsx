import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  const allCategories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-100", count: "1.2K items" },
    { name: "Fashion", icon: "👗", color: "bg-pink-100", count: "856 items" },
    { name: "Home & Garden", icon: "🏠", color: "bg-green-100", count: "642 items" },
    { name: "Sports", icon: "⚽", color: "bg-orange-100", count: "428 items" },
    { name: "Books", icon: "📚", color: "bg-red-100", count: "234 items" },
    { name: "Cars", icon: "🚗", color: "bg-yellow-100", count: "567 items" },
    { name: "Beauty", icon: "💄", color: "bg-purple-100", count: "389 items" },
    { name: "Furniture", icon: "🪑", color: "bg-indigo-100", count: "445 items" },
    { name: "Jewelry", icon: "💍", color: "bg-pink-200", count: "156 items" },
    { name: "Toys", icon: "🧸", color: "bg-yellow-200", count: "267 items" },
    { name: "Pet Supplies", icon: "🐕", color: "bg-green-200", count: "178 items" },
    { name: "Tools", icon: "🔧", color: "bg-gray-100", count: "324 items" },
    { name: "Gaming", icon: "🎮", color: "bg-blue-200", count: "456 items" },
    { name: "Music", icon: "🎵", color: "bg-purple-200", count: "123 items" },
    { name: "Art", icon: "🎨", color: "bg-red-200", count: "89 items" },
    { name: "Collectibles", icon: "🏆", color: "bg-orange-200", count: "145 items" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">All Categories</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10 h-12 rounded-full"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {allCategories.map((category) => (
            <div
              key={category.name}
              className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/category/${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`)}
            >
              <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mb-3 mx-auto`}>
                <span className="text-2xl">{category.icon}</span>
              </div>
              <h3 className="font-semibold text-center mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground text-center">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;