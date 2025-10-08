import { useEffect, useState } from 'react';
import { Star, TrendingUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  approvedReviews: number;
  pendingReviews: number;
  sentimentPositive: number;
  sentimentNegative: number;
}

interface RecentReview {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
  status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    sentimentPositive: 0,
    sentimentNegative: 0,
  });
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviews) {
        const approved = reviews.filter(r => r.status === 'approved');
        const pending = reviews.filter(r => r.status === 'pending');
        const avgRating = reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

        const positive = reviews.filter(r => r.sentiment_label === 'positive').length;
        const negative = reviews.filter(r => r.sentiment_label === 'negative').length;

        setStats({
          totalReviews: reviews.length,
          averageRating: avgRating,
          approvedReviews: approved.length,
          pendingReviews: pending.length,
          sentimentPositive: positive,
          sentimentNegative: negative,
        });

        setRecentReviews(reviews.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: MessageSquare,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
      trend: '+0.3',
    },
    {
      title: 'Approved',
      value: stats.approvedReviews,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReviews,
      icon: AlertCircle,
      color: 'bg-orange-500',
      trend: `${stats.pendingReviews} waiting`,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">{card.trend}</span>
                  </div>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No reviews yet</p>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-900">{review.author_name}</p>
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
                    <p className="text-sm text-slate-600 line-clamp-2">{review.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        review.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : review.status === 'pending'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sentiment Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Positive</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.totalReviews > 0 ? Math.round((stats.sentimentPositive / stats.totalReviews) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalReviews > 0 ? (stats.sentimentPositive / stats.totalReviews) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Neutral</span>
                <span className="text-sm font-semibold text-slate-600">
                  {stats.totalReviews > 0
                    ? Math.round(((stats.totalReviews - stats.sentimentPositive - stats.sentimentNegative) / stats.totalReviews) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-slate-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.totalReviews > 0
                        ? ((stats.totalReviews - stats.sentimentPositive - stats.sentimentNegative) / stats.totalReviews) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Negative</span>
                <span className="text-sm font-semibold text-red-600">
                  {stats.totalReviews > 0 ? Math.round((stats.sentimentNegative / stats.totalReviews) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.totalReviews > 0 ? (stats.sentimentNegative / stats.totalReviews) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Overall Sentiment</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.sentimentPositive > stats.sentimentNegative ? 'Positive' : 'Needs Attention'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
