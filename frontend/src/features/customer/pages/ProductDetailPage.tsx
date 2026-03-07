import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useGetProductQuestionsQuery,
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetReviewsQuery,
  useGetRatingSummaryQuery,
  useCreateReviewMutation,
} from '@/store/api';
import { useAppSelector, useAppDispatch, addToLocalCart } from '@/store';
import { ImageGallery } from '@/common/components/ImageGallery';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { RatingStars } from '@/common/components/RatingStars';
import { StatusBadge } from '@/common/components/StatusBadge';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { ErrorState } from '@/common/components/EmptyState';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Separator } from '@/common/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });

  // Detect if param is a UUID (from cart links etc.) vs a slug
  const isUuid = slug ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) : false;

  const {
    data: slugRes,
    isLoading: slugLoading,
    isError: slugError,
    refetch: slugRefetch,
  } = useGetProductBySlugQuery(slug!, { skip: !slug || isUuid });

  const {
    data: idRes,
    isLoading: idLoading,
    isError: idError,
    refetch: idRefetch,
  } = useGetProductByIdQuery(slug!, { skip: !slug || !isUuid });

  const productRes = isUuid ? idRes : slugRes;
  const isLoading = isUuid ? idLoading : slugLoading;
  const isError = isUuid ? idError : slugError;
  const refetch = isUuid ? idRefetch : slugRefetch;

  const product = productRes?.data;

  const { data: questionsRes } = useGetProductQuestionsQuery(
    product?.id ?? '',
    { skip: !product?.id },
  );

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();

  const { data: reviewsRes } = useGetReviewsQuery(
    { productId: product?.id ?? '', page: 1, limit: 10 },
    { skip: !product?.id },
  );
  const { data: ratingSummaryRes } = useGetRatingSummaryQuery(
    product?.id ?? '',
    { skip: !product?.id },
  );

  if (isLoading) return <LoadingSpinner fullScreen label="Loading product..." />;
  if (isError || !product) {
    return (
      <ErrorState
        title="Product not found"
        message="This product may have been removed or the URL is incorrect."
        onRetry={refetch}
      />
    );
  }

  const images = (product.images ?? []).map((img) => ({
    url: img.url,
    alt: product.name,
  }));

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice ?? undefined;

  const handleAddToCart = async () => {
    if (isAuthenticated) {
      try {
        await addToCart({
          productId: product.id,
          variantId: selectedVariantId,
          quantity,
        }).unwrap();
        toast.success('Added to cart');
      } catch {
        toast.error('Failed to add to cart');
      }
    } else {
      dispatch(
        addToLocalCart({
          productId: product.id,
          variantId: selectedVariantId,
          slug: product.slug,
          quantity,
          name: product.name,
          price: displayPrice,
          image: product.images?.[0]?.url ?? undefined,
        }),
      );
      toast.success('Added to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await addToWishlist({ productId: product.id }).unwrap();
      toast.success('Added to wishlist');
    } catch {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleCreateReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    try {
      await createReview({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title || undefined,
        content: reviewForm.content || undefined,
      }).unwrap();
      toast.success('Review submitted');
      setShowReviewDialog(false);
      setReviewForm({ rating: 5, title: '', content: '' });
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const reviews = reviewsRes?.data?.items ?? [];
  const ratingSummary = ratingSummaryRes?.data;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary hover:underline transition-colors">
          Home
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <Link to="/products" className="hover:text-primary hover:underline transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <Link
              to={`/categories/${product.category.slug}`}
              className="hover:text-primary hover:underline transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <ImageGallery images={images} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.brand && (
              <Badge variant="outline" className="mb-2">
                {product.brand.name}
              </Badge>
            )}
            <h1 className="text-2xl font-bold lg:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars
                rating={product.avgRating ?? 0}
                showValue
                reviewCount={product.totalReviews ?? 0}
              />
              <StatusBadge status={product.status} />
            </div>
          </div>

          <PriceDisplay
            price={displayPrice}
            compareAtPrice={displayCompareAt}
            size="lg"
          />

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Variant</label>
              <Select
                value={selectedVariantId ?? ''}
                onValueChange={(val) => setSelectedVariantId(val || undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} — {variant.price?.toLocaleString?.() ?? 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold shadow-sm h-11"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <span className="font-medium text-green-700 dark:text-green-400">FREE Delivery</span>
                <span className="text-muted-foreground ml-1">on orders over PKR 5,000</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <span className="font-medium">Secure transaction</span>
                <span className="text-muted-foreground ml-1">&mdash; your purchase is protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="description">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="questions">
            Q&A ({questionsRes?.data?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({ratingSummary?.totalReviews ?? product.totalReviews ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                product.description ?? 'No description available.',
                { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'blockquote', 'code', 'pre'], ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'] },
              ),
            }}
          />
        </TabsContent>

        <TabsContent value="specifications" className="mt-4">
          {product.attributes && product.attributes.length > 0 ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              {product.attributes.map((attr) => (
                <div key={attr.id} className="flex gap-2 rounded-md bg-muted/50 p-3">
                  <dt className="font-medium">{attr.attributeId}:</dt>
                  <dd className="text-muted-foreground">{attr.valueText}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted-foreground">No specifications available.</p>
          )}
        </TabsContent>

        <TabsContent value="questions" className="mt-4 space-y-4">
          {questionsRes?.data && questionsRes.data.length > 0 ? (
            questionsRes.data.map((q: { id: string; questionText: string; answers?: { answerText: string }[] }) => (
              <div key={q.id} className="space-y-1 rounded-md border p-4">
                <p className="font-medium">Q: {q.questionText}</p>
                {q.answers?.[0] && (
                  <p className="text-sm text-muted-foreground">
                    A: {q.answers[0].answerText}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No questions yet.</p>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-6">
          {/* Rating Summary */}
          {ratingSummary && (
            <div className="flex items-start gap-8 rounded-lg border p-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{ratingSummary.averageRating.toFixed(1)}</p>
                <RatingStars rating={ratingSummary.averageRating} />
                <p className="text-sm text-muted-foreground mt-1">{ratingSummary.totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingSummary.ratingDistribution[star] ?? 0;
                  const pct = ratingSummary.totalReviews > 0 ? (count / ratingSummary.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-right">{star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={() => setShowReviewDialog(true)}
            className="bg-[hsl(var(--amazon-orange))] hover:bg-[hsl(var(--amazon-orange-hover))] text-[hsl(var(--navy))] font-bold"
          >
            <Star className="mr-2 h-4 w-4" /> Write a Review
          </Button>

          {/* Review List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} />
                    {review.title && <span className="font-medium">{review.title}</span>}
                  </div>
                  {review.content && <p className="text-sm">{review.content}</p>}
                  {review.pros && review.pros.length > 0 && (
                    <p className="text-sm text-green-600">Pros: {review.pros.join(', ')}</p>
                  )}
                  {review.cons && review.cons.length > 0 && (
                    <p className="text-sm text-red-600">Cons: {review.cons.join(', ')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {review.isVerifiedPurchase && <Badge variant="secondary" className="mr-2">Verified</Badge>}
                    {review.helpfulCount > 0 && `${review.helpfulCount} found helpful`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Write a Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Select value={String(reviewForm.rating)} onValueChange={(v) => setReviewForm((f) => ({ ...f, rating: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} Star{r > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Review title (optional)" value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Share your experience..." rows={4} value={reviewForm.content} onChange={(e) => setReviewForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateReview} disabled={isCreatingReview}>
              {isCreatingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
