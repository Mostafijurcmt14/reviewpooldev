import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

interface ReviewWidgetProps {
  productId?: string;
  limit?: number;
}

export default function ReviewWidget({ productId, limit = 5 }: ReviewWidgetProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setReviews(data);
        const avg = data.length > 0
          ? data.reduce((acc, r) => acc + r.rating, 0) / data.length
          : 0;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold text-slate-900">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-slate-600">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-200 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900">{review.author_name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{review.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
