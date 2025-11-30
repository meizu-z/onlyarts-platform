import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import {
  analyticsService,
  mockProfileAnalytics,
  mockAudienceDemographics,
  mockEngagementTimeline,
  mockRevenueAnalytics
} from '../services/analytics.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PremiumBadge from '../components/common/PremiumBadge';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Star,
  DollarSign,
  Users,
  BarChart3,
  Crown,
  Lock,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';

// Demo mode - set to false when backend is ready
const USE_DEMO_MODE = true;

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const tier = user?.subscription || 'free';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_DEMO_MODE) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalytics(mockAnalyticsData[tier]);
      } else {
        // Call real API
        const data = await analyticsService.getOverview();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#f2e9dd] mb-8">Analytics Dashboard</h1>
        <LoadingPaint message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-[#f2e9dd] mb-8">Analytics Dashboard</h1>
        <APIError error={error} retry={fetchAnalytics} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#f2e9dd] mb-2">Analytics Dashboard</h1>
          <p className="text-[#f2e9dd]/70">Track your performance and audience insights</p>
        </div>
        <PremiumBadge tier={tier} size="lg" />
      </div>

      {/* FREE TIER - Profile Views Only */}
      {tier === 'free' && (
        <>
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-lg">
                <Eye size={24} className="text-[#7C5FFF]" />
              </div>
              <div>
                <p className="text-sm text-[#f2e9dd]/70">Profile Views</p>
                <p className="text-3xl font-bold text-[#f2e9dd]">{analytics.profileViews.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <div className="flex items-start gap-4">
              <Lock size={32} className="text-indigo-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">Unlock Advanced Analytics</h3>
                <p className="text-[#f2e9dd]/70 mb-4">
                  Upgrade to Basic to access engagement metrics, top fans, revenue breakdown, and more!
                </p>
                <ul className="space-y-2 mb-6 text-sm text-[#f2e9dd]/70">
                  <li className="flex items-center gap-2">
                    <Heart size={16} className="text-indigo-400" />
                    Engagement metrics (likes, comments, favorites)
                  </li>
                  <li className="flex items-center gap-2">
                    <Users size={16} className="text-indigo-400" />
                    Top fans and followers list
                  </li>
                  <li className="flex items-center gap-2">
                    <DollarSign size={16} className="text-indigo-400" />
                    Revenue breakdown and sales analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-400" />
                    Artwork performance metrics
                  </li>
                </ul>
                <Button
                  onClick={() => navigate('/subscriptions')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <Crown size={16} className="mr-2" />
                  Upgrade to Basic
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* BASIC TIER - Advanced Analytics */}
      {tier === 'basic' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={Eye}
              label="Profile Views"
              value={analytics.profileViews.toLocaleString()}
              color="from-blue-500/20 to-cyan-500/20"
              iconColor="text-blue-400"
            />
            <StatsCard
              icon={Heart}
              label="Total Likes"
              value={analytics.engagement.likes.toLocaleString()}
              color="from-pink-500/20 to-rose-500/20"
              iconColor="text-pink-400"
            />
            <StatsCard
              icon={MessageCircle}
              label="Comments"
              value={analytics.engagement.comments.toLocaleString()}
              color="from-purple-500/20 to-indigo-500/20"
              iconColor="text-purple-400"
            />
            <StatsCard
              icon={DollarSign}
              label="Revenue"
              value={`₱${analytics.revenue.total.toLocaleString()}`}
              color="from-green-500/20 to-emerald-500/20"
              iconColor="text-green-400"
            />
          </div>

          {/* Engagement & Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <Activity size={20} className="text-[#7C5FFF]" />
                Engagement Breakdown
              </h3>
              <div className="space-y-4">
                <ProgressBar label="Likes" value={analytics.engagement.likes} max={analytics.engagement.likes + 200} color="bg-pink-500" />
                <ProgressBar label="Comments" value={analytics.engagement.comments} max={analytics.engagement.likes} color="bg-purple-500" />
                <ProgressBar label="Favorites" value={analytics.engagement.favorites} max={analytics.engagement.likes} color="bg-amber-500" />
              </div>
            </Card>

            {/* Revenue Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-400" />
                Revenue Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#f2e9dd]/70">Total Revenue</span>
                  <span className="text-2xl font-bold text-green-400">₱{analytics.revenue.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#f2e9dd]/70">Total Sales</span>
                  <span className="text-xl font-bold text-[#f2e9dd]">{analytics.revenue.sales}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#f2e9dd]/70">Avg. per Sale</span>
                  <span className="text-xl font-bold text-[#f2e9dd]">
                    ₱{analytics.revenue.sales > 0 ? Math.round(analytics.revenue.total / analytics.revenue.sales).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Fans */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
              <Star size={20} className="text-amber-400" />
              Top Fans
            </h3>
            <div className="space-y-3">
              {analytics.topFans.map((fan, idx) => (
                <div key={fan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-sm font-bold">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f2e9dd]">{fan.display_name}</p>
                      <p className="text-sm text-[#f2e9dd]/50">@{fan.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#7C5FFF] font-bold">{fan.interaction_count}</p>
                    <p className="text-xs text-[#f2e9dd]/50">interactions</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Premium Upgrade Prompt */}
          <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <div className="flex items-start gap-4">
              <Sparkles size={32} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">Unlock Premium Analytics</h3>
                <p className="text-[#f2e9dd]/70 mb-4">
                  Upgrade to Premium for AI-powered insights, demographics, behavior patterns, and sales forecasts!
                </p>
                <Button
                  onClick={() => navigate('/subscriptions')}
                  className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"
                >
                  <Crown size={16} className="mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* PREMIUM TIER - Full Analytics */}
      {tier === 'premium' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={Eye}
              label="Profile Views"
              value={analytics.profileViews.toLocaleString()}
              color="from-blue-500/20 to-cyan-500/20"
              iconColor="text-blue-400"
            />
            <StatsCard
              icon={Heart}
              label="Total Likes"
              value={analytics.engagement.likes.toLocaleString()}
              color="from-pink-500/20 to-rose-500/20"
              iconColor="text-pink-400"
            />
            <StatsCard
              icon={MessageCircle}
              label="Comments"
              value={analytics.engagement.comments.toLocaleString()}
              color="from-purple-500/20 to-indigo-500/20"
              iconColor="text-purple-400"
            />
            <StatsCard
              icon={DollarSign}
              label="Revenue"
              value={`₱${analytics.revenue.total.toLocaleString()}`}
              color="from-green-500/20 to-emerald-500/20"
              iconColor="text-green-400"
              badge={<TrendingUp size={16} className="text-green-400" />}
            />
          </div>

          {/* AI Insights */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              AI-Powered Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.insights.map((insight, idx) => (
                <Card key={idx} className={`p-4 border ${
                  insight.level === 'positive' ? 'border-green-500/30 bg-green-500/10' :
                  insight.level === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' :
                  'border-blue-500/30 bg-blue-500/10'
                }`}>
                  <div className="flex items-start gap-3">
                    <Target size={20} className={
                      insight.level === 'positive' ? 'text-green-400' :
                      insight.level === 'success' ? 'text-emerald-400' :
                      'text-blue-400'
                    } />
                    <p className="text-sm text-[#f2e9dd]/90">{insight.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Demographics & Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Demographics */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <Users size={20} className="text-[#7C5FFF]" />
                Audience Demographics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#f2e9dd]/70 mb-2">Age Groups</p>
                  {Object.entries(analytics.demographics.ageGroups).map(([age, percent]) => (
                    <ProgressBar key={age} label={age} value={percent} max={100} color="bg-purple-500" suffix="%" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f2e9dd]/70 mb-2 mt-4">Top Locations</p>
                  {Object.entries(analytics.demographics.locations).map(([location, percent]) => (
                    <ProgressBar key={location} label={location} value={percent} max={100} color="bg-blue-500" suffix="%" />
                  ))}
                </div>
              </div>
            </Card>

            {/* Forecast */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                Growth Forecast
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                  <p className="text-sm text-[#f2e9dd]/70 mb-1">Next 7 Days</p>
                  <p className="text-3xl font-bold text-green-400">{analytics.forecast.next7Days.toLocaleString()}</p>
                  <p className="text-xs text-[#f2e9dd]/50 mt-1">Predicted views</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-[#f2e9dd]/70 mb-1">Next 30 Days</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.forecast.next30Days.toLocaleString()}</p>
                  <p className="text-xs text-[#f2e9dd]/50 mt-1">Predicted views</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#f2e9dd]/70">Confidence Level</span>
                  <span className="text-[#7C5FFF] font-bold capitalize">{analytics.forecast.confidence}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#f2e9dd]/70">Trend</span>
                  <span className="text-green-400 font-bold capitalize flex items-center gap-1">
                    <TrendingUp size={14} />
                    {analytics.forecast.trend}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Fans */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
              <Star size={20} className="text-amber-400" />
              Top Fans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.topFans.map((fan, idx) => (
                <div key={fan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-sm font-bold">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[#f2e9dd]">{fan.display_name}</p>
                      <p className="text-sm text-[#f2e9dd]/50">@{fan.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#7C5FFF] font-bold">{fan.interaction_count}</p>
                    <p className="text-xs text-[#f2e9dd]/50">interactions</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

// Reusable Components

const StatsCard = ({ icon: Icon, label, value, color, iconColor, badge }) => (
  <Card className={`p-4 bg-gradient-to-br ${color}`}>
    <div className="flex items-start justify-between mb-2">
      <Icon size={24} className={iconColor} />
      {badge}
    </div>
    <p className="text-sm text-[#f2e9dd]/70 mb-1">{label}</p>
    <p className="text-2xl font-bold text-[#f2e9dd]">{value}</p>
  </Card>
);

const ProgressBar = ({ label, value, max, color, suffix = '' }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#f2e9dd]/70">{label}</span>
        <span className="text-[#f2e9dd] font-semibold">{value}{suffix}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export { AnalyticsPage };
export default AnalyticsPage;
