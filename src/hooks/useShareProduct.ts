import { useToast } from "@/hooks/use-toast";

export function useShareProduct() {
  const { toast } = useToast();

  const shareProduct = async (productId: string, title: string) => {
    const productUrl = `${window.location.origin}/product/${productId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this product: ${title}`,
          url: productUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(productUrl, title);
        }
      }
    } else {
      fallbackShare(productUrl, title);
    }
  };

  const fallbackShare = (url: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: "Link copied!",
          description: "Product link has been copied to your clipboard.",
        });
      }).catch(() => {
        showShareDialog(url, title);
      });
    } else {
      showShareDialog(url, title);
    }
  };

  const showShareDialog = (url: string, title: string) => {
    const shareText = `Check out this product: ${title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    // For now, just copy to clipboard and show toast
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends.",
      });
    }
  };

  return { shareProduct };
}