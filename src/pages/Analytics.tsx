import { useEffect, useState } from 'react';
import { TrendingUp, Star, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  reviewGrowth: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  ratingDistribution: { rating: number; count: number }[];
  dailyStats: { date: string; count: number; avgRating: number }[];
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReviews: 0,
    averageRating: 0,
    reviewGrowth: 0,
    sentimentPositive: 0,
    sentimentNeutral: 0,
    sentimentNegative: 0,
    ratingDistribution: [],
    dailyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (reviews) {
        const avgRating = reviews.length > 0
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          : 0;

        const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: reviews.filter(r => r.rating === rating).length,
        }));

        const positive = reviews.filter(r => r.sentiment_label === 'positive').length;
        const negative = reviews.filter(r => r.sentiment_label === 'negative').length;
        const neutral = reviews.length - positive - negative;

        const dailyMap = new Map<string, { count: number; totalRating: number }>();
        reviews.forEach(review => {
          const date = new Date(review.created_at).toISOString().split('T')[0];
          const existing = dailyMap.get(date) || { count: 0, totalRating: 0 };
          dailyMap.set(date, {
            count: existing.count + 1,
            totalRating: existing.totalRating + review.rating,
          });
        });

        const dailyStats = Array.from(dailyMap.entries())
          .map(([date, stats]) => ({
            date,
            count: stats.count,
            avgRating: stats.totalRating / stats.count,
          }))
          .slice(-7);

        const prevPeriodStart = new Date(daysAgo);
        prevPeriodStart.setDate(prevPeriodStart.getDate() - parseInt(timeRange));
        const { data: prevReviews } = await supabase
          .from('reviews')
          .select('id')
          .gte('created_at', prevPeriodStart.toISOString())
          .lt('created_at', daysAgo.toISOString());

        const growth = prevReviews && prevReviews.length > 0
          ? ((reviews.length - prevReviews.length) / prevReviews.length) * 100
          : 0;

        setAnalytics({
          totalReviews: reviews.length,
          averageRating: avgRating,
          reviewGrowth: growth,
          sentimentPositive: positive,
          sentimentNeutral: neutral,
          sentimentNegative: negative,
          ratingDistribution: ratingDist,
          dailyStats,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxDaily = Math.max(...analytics.dailyStats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics Overview</h2>
          <p className="text-slate-600 mt-1">Track review performance and sentiment trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-600">Total Reviews</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-2">{analytics.totalReviews}</p>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${analytics.reviewGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.reviewGrowth >= 0 ? '+' : ''}{analytics.reviewGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-slate-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-600">Average Rating</p>
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-2">{analytics.averageRating.toFixed(1)}</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(analytics.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-600">Sentiment Score</p>
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-2">
            {analytics.totalReviews > 0
              ? Math.round((analytics.sentimentPositive / analytics.totalReviews) * 100)
              : 0}%
          </p>
          <p className="text-sm text-slate-500">Positive sentiment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Rating Distribution</h3>
          <div className="space-y-4">
            {analytics.ratingDistribution.reverse().map((dist) => (
              <div key={dist.rating}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{dist.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{dist.count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${analytics.totalReviews > 0 ? (dist.count / analytics.totalReviews) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Sentiment Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Positive</p>
                  <p className="text-sm text-green-700">{analytics.sentimentPositive} reviews</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {analytics.totalReviews > 0
                  ? Math.round((analytics.sentimentPositive / analytics.totalReviews) * 100)
                  : 0}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Neutral</p>
                  <p className="text-sm text-slate-700">{analytics.sentimentNeutral} reviews</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-600">
                {analytics.totalReviews > 0
                  ? Math.round((analytics.sentimentNeutral / analytics.totalReviews) * 100)
                  : 0}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ThumbsDown className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Negative</p>
                  <p className="text-sm text-red-700">{analytics.sentimentNegative} reviews</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {analytics.totalReviews > 0
                  ? Math.round((analytics.sentimentNegative / analytics.totalReviews) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Review Trend (Last 7 Days)</h3>
        {analytics.dailyStats.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No data available for this period</p>
        ) : (
          <div className="flex items-end justify-between gap-2 h-64">
            {analytics.dailyStats.map((stat) => (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end flex-1">
                  <div className="text-xs font-medium text-slate-700 mb-1">{stat.count}</div>
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                    style={{ height: `${(stat.count / maxDaily) * 100}%`, minHeight: '4px' }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500">{stat.avgRating.toFixed(1)}★</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
