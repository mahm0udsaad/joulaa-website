import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Link2,
  Share2,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    name: string;
    id: string;
    image_urls?: string[];
    description?: string;
    price?: number;
    brand?: string;
  };
  t: Function;
}

export default function ShareModal({
  open,
  onOpenChange,
  product,
  t,
}: ShareModalProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    setProductUrl(`${window.location.origin}/product/${product.id}`);
  }, [product.id]);

  const description =
    product.description || `Check out ${product.name} by ${product.brand}`;
  const shareMessage = `${product.name} - ${description}. Shop now: ${productUrl}`;
  const hashtags = "cosmetics,beauty,makeup";

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-500",
      textColor: "text-white",
      hoverColor: "hover:bg-blue-600",
      action: () => {
        setIsSharing(true);
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
          "_blank",
          "width=600,height=400",
        );
        setIsSharing(false);
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-400",
      textColor: "text-white",
      hoverColor: "hover:bg-sky-500",
      action: () => {
        setIsSharing(true);
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&hashtags=${hashtags}`,
          "_blank",
          "width=600,height=400",
        );
        setIsSharing(false);
      },
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500",
      textColor: "text-white",
      hoverColor: "hover:bg-green-600",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
          "_blank",
        );
      },
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
      textColor: "text-white",
      hoverColor: "hover:opacity-90",
      action: () => {
        // Instagram doesn't support direct sharing via URL
        navigator.clipboard.writeText(productUrl);
        toast({
          title: t("share.instagramCopy") || "Ready for Instagram!",
          description:
            t("share.instagramCopyDesc") ||
            "Link copied to clipboard. Open Instagram and paste in your story.",
        });
      },
    },
    {
      name: "Copy Link",
      icon: Link2,
      color: "bg-gray-100",
      textColor: "text-gray-800",
      hoverColor: "hover:bg-gray-200",
      action: async () => {
        try {
          await navigator.clipboard.writeText(productUrl);
          toast({
            title: t("share.linkCopied") || "Link Copied!",
            description:
              t("share.linkCopiedDesc") ||
              "Product link has been copied to clipboard",
          });
        } catch (err) {
          toast({
            title: t("share.error") || "Error",
            description:
              t("share.errorDesc") || "Could not copy link to clipboard",
            variant: "destructive",
          });
        }
      },
    },
  ];

  // Function to share using Web Share API if available
  const shareWithNativeAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: description,
          url: productUrl,
        });
        toast({
          title: "Shared successfully",
          description: "Content has been shared",
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast({
            title: "Error sharing",
            description: "Could not share content",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "Not supported",
        description: "Native sharing is not supported on this device",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg border-0 shadow-lg">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-medium">
            <Share2 className="h-5 w-5" />
            <span>{t("share.title") || "Share Product"}</span>
          </DialogTitle>

          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {t("share.subtitle") ||
                `Share ${product.name} with your friends and followers`}
            </p>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Product preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
            {product.image_urls && product.image_urls[0] && (
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={product.image_urls[0].replace(/[{}]/g, "")}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/64/64";
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              {product.brand && (
                <p className="text-xs text-gray-500">{product.brand}</p>
              )}
              {product.price && (
                <p className="text-sm font-semibold mt-1">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Share options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                className={`flex flex-col items-center justify-center gap-2 h-20 transition-all ${option.color} ${option.textColor} ${option.hoverColor}`}
                onClick={option.action}
                disabled={isSharing}
              >
                <option.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{option.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {navigator.share && (
          <div className="mt-4">
            <Button
              variant="default"
              className="w-full"
              onClick={shareWithNativeAPI}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t("share.nativeShare") || "Share with device"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
