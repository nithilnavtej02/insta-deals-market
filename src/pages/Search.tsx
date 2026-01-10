import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, ArrowLeft, User, Shield, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";
import { sanitizeInput, globalRateLimiter } from "@/utils/security";
import { getRandomAvatarEmoji, formatNumber } from "@/utils/randomStats";

interface SearchResult {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  verified: boolean;
  followers_count: number;
}

const Search = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sanitizedQuery = sanitizeInput(query);
    
    if (sanitizedQuery.trim() && sanitizedQuery.length >= 2) {
      if (globalRateLimiter.canMakeRequest('search', 10, 60000)) {
        const timeoutId = setTimeout(() => {
          searchUsers(sanitizedQuery);
        }, 300);
        
        return () => clearTimeout(timeoutId);
      }
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_users_securely', { search_query: searchQuery });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
        {/* Header with Search */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 h-12 rounded-full bg-muted/50 border-0"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading && (
            <div className="text-center py-12">
              <div className="w-10 h-10 mx-auto mb-3 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">No users found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((user) => (
                <Card
                  key={user.id}
                  className="border-0 shadow-md bg-card/80 backdrop-blur-sm cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-lg">
                          {user.avatar_url ? user.username?.slice(0, 2).toUpperCase() : getRandomAvatarEmoji(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{user.display_name || user.username}</span>
                          {user.verified && (
                            <Badge variant="secondary" className="h-5 px-1.5 bg-blue-500/10 text-blue-500 border-0">
                              <Shield className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Users className="h-3 w-3" />
                          <span>{formatNumber(user.followers_count)} followers</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!query && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <SearchIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Search Users</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Find sellers, buyers, and other members of the community
              </p>
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
        <div className="max-w-3xl mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users by username or display name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 rounded-full text-lg bg-muted/50 border-0"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Searching...</p>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No users found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </CardContent>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((user) => (
              <Card
                key={user.id}
                className="border-0 shadow-lg bg-card/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-2 ring-primary/10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xl">
                        {user.avatar_url ? user.username?.slice(0, 2).toUpperCase() : getRandomAvatarEmoji(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{user.display_name || user.username}</span>
                        {user.verified && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-0">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{formatNumber(user.followers_count)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!query && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <SearchIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Search Users</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Find sellers, buyers, and other members of our community by username or display name
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;