"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

export default function ProductReviewModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  title,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: { stars: number; comment: string }) => void;
  loading?: boolean;
  title: string;
  t: (key: string, options?: any) => string;
}) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              className={n <= stars ? "text-yellow-400" : "text-gray-300"}
              aria-label={t("product.rateStar", { n })}
            >
              <Star className="h-6 w-6 fill-current" />
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("product.writeReviewPlaceholder")}
          rows={4}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              {t("common.actions.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={() => onSubmit({ stars, comment })}
            disabled={loading || !comment.trim()}
            loading={loading}
          >
            {t("product.submitReview")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
