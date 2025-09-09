import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/usePublicProfile";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  useEffect(() => {
    // Fetch profile ID by username and redirect to PublicProfile
    const fetchProfileId = async () => {
      if (!username) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();
        
        if (data && !error) {
          navigate(`/profile/${data.id}`, { replace: true });
        } else {
          // Show error or redirect to not found
          navigate('/not-found', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/not-found', { replace: true });
      }
    };

    fetchProfileId();
  }, [username, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to profile...</p>
      </div>
    </div>
  );
};

export default SellerProfile;