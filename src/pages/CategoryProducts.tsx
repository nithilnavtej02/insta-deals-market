import { ArrowLeft, Heart, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useState, useEffect } from "react";

const CategoryProducts = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        setCategoryName(category.name);
        const filteredProducts = products.filter(product => product.category_id === categoryId);
        setCategoryProducts(filteredProducts);
      }
    }
  }, [categoryId, categories, products]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{categoryName}</h1>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {productsLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No items available right now</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categoryProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-40 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                {product.condition && (
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                    {product.condition}
                  </Badge>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">${product.original_price}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>By seller</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location || 'Location not set'}</span>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;