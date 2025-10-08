import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    rating: 0,
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId || null,
          author_name: formData.author_name,
          author_email: formData.author_email,
          rating: formData.rating,
          title: formData.title || null,
          content: formData.content,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setFormData({
        author_name: '',
        author_email: '',
        rating: 0,
        title: '',
        content: '',
      });

      alert('Thank you for your review! It will be published after moderation.');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, rating })}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating <= (hoveredRating || formData.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm font-medium text-slate-700">
                {formData.rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Sum up your experience"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            placeholder="Tell us about your experience..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Minimum 50 characters ({formData.content.length}/50)
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || formData.content.length < 50}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
