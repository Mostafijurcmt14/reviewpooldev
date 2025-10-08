import { X, Star, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  review: {
    id: string;
    author_name: string;
    author_email: string;
    rating: number;
    title: string | null;
    content: string;
    status: string;
    created_at: string;
    sentiment_label: string | null;
    ai_summary: string | null;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function ReviewModal({ review, onClose, onUpdate }: ReviewModalProps) {
  const updateStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', review.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900">Review Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">{review.author_name}</h4>
              <p className="text-sm text-slate-600">{review.author_email}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {review.title && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Title</p>
              <p className="text-base text-slate-900">{review.title}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Review Content</p>
            <p className="text-slate-900 leading-relaxed">{review.content}</p>
          </div>

          {review.ai_summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">AI Summary</p>
              <p className="text-sm text-blue-800">{review.ai_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                review.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : review.status === 'pending'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {review.status}
              </span>
            </div>

            {review.sentiment_label && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Sentiment</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  review.sentiment_label === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : review.sentiment_label === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {review.sentiment_label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 bg-slate-50">
          {review.status !== 'approved' && (
            <button
              onClick={() => updateStatus('approved')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
          )}
          {review.status !== 'rejected' && (
            <button
              onClick={() => updateStatus('rejected')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
