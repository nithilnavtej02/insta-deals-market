import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";

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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      searchUsers(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, verified, followers_count')
        .ilike('username', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="pb-20">
        {loading && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Searching...</div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No users found for "{query}"</div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-1">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{user.username}</span>
                    {user.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  {user.display_name && (
                    <div className="text-sm text-muted-foreground">{user.display_name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {user.followers_count} followers
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!query && (
          <div className="text-center py-8">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <div className="text-muted-foreground">Search for users by username</div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;