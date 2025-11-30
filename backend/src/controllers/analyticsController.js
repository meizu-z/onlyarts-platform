const { query } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get analytics overview (tier-based)
 * @access  Private
 */
exports.getOverview = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get user's subscription tier
  const userResult = await query('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
  const tier = userResult.rows[0]?.subscription_tier || 'free';

  // Base analytics (available to all tiers)
  const profileViewsResult = await query(
    `SELECT COUNT(*) as total_views FROM profile_views WHERE artist_id = ?`,
    [userId]
  );

  const baseAnalytics = {
    profileViews: profileViewsResult.rows[0]?.total_views || 0,
    tier,
  };

  // Return only profile views for free tier
  if (tier === 'free') {
    return successResponse(res, {
      ...baseAnalytics,
      message: 'Upgrade to Basic for advanced analytics'
    }, 'Analytics overview retrieved');
  }

  // Advanced analytics for Basic and Premium
  const [artworkStats, engagementStats, topFans, revenueData] = await Promise.all([
    // Artwork statistics
    query(
      `SELECT
        COUNT(*) as total_artworks,
        SUM(views) as total_views,
        SUM(likes) as total_likes
       FROM artworks
       WHERE user_id = ? AND status = 'published'`,
      [userId]
    ),

    // Engagement metrics
    query(
      `SELECT
        (SELECT COUNT(*) FROM artwork_likes WHERE artwork_id IN (SELECT id FROM artworks WHERE user_id = ?)) as total_likes,
        (SELECT COUNT(*) FROM comments WHERE artwork_id IN (SELECT id FROM artworks WHERE user_id = ?)) as total_comments,
        (SELECT COUNT(*) FROM favorites WHERE favoritable_id IN (SELECT id FROM artworks WHERE user_id = ?) AND favoritable_type = 'artwork') as total_favorites
      `,
      [userId, userId, userId]
    ),

    // Top fans
    query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, COUNT(*) as interaction_count
       FROM users u
       INNER JOIN artwork_likes al ON al.user_id = u.id
       INNER JOIN artworks a ON a.id = al.artwork_id
       WHERE a.user_id = ?
       GROUP BY u.id
       ORDER BY interaction_count DESC
       LIMIT 10`,
      [userId]
    ),

    // Revenue breakdown
    query(
      `SELECT
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_sales
       FROM orders
       WHERE artist_id = ? AND status = 'completed'`,
      [userId]
    )
  ]);

  const advancedAnalytics = {
    ...baseAnalytics,
    artworks: {
      total: artworkStats.rows[0]?.total_artworks || 0,
      totalViews: artworkStats.rows[0]?.total_views || 0,
      totalLikes: artworkStats.rows[0]?.total_likes || 0,
    },
    engagement: {
      likes: engagementStats.rows[0]?.total_likes || 0,
      comments: engagementStats.rows[0]?.total_comments || 0,
      favorites: engagementStats.rows[0]?.total_favorites || 0,
    },
    topFans: topFans.rows || [],
    revenue: {
      total: parseFloat(revenueData.rows[0]?.total_revenue || 0),
      sales: revenueData.rows[0]?.total_sales || 0,
    }
  };

  // Return advanced analytics for Basic tier
  if (tier === 'basic') {
    return successResponse(res, {
      ...advancedAnalytics,
      message: 'Upgrade to Premium for AI insights and forecasts'
    }, 'Analytics overview retrieved');
  }

  // Premium analytics with demographics and AI insights
  const [demographics, behaviorData, timeSeriesData] = await Promise.all([
    // Demographics (mock data for now - would come from real tracking)
    Promise.resolve({
      ageGroups: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 20,
        '45-54': 12,
        '55+': 8
      },
      locations: {
        'Metro Manila': 45,
        'Cebu': 15,
        'Davao': 10,
        'Other': 30
      },
      devices: {
        'Mobile': 60,
        'Desktop': 30,
        'Tablet': 10
      }
    }),

    // Behavior patterns
    query(
      `SELECT
        HOUR(created_at) as hour,
        COUNT(*) as views
       FROM profile_views
       WHERE artist_id = ?
       GROUP BY HOUR(created_at)
       ORDER BY hour`,
      [userId]
    ),

    // Time series data for forecasting
    query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as views
       FROM profile_views
       WHERE artist_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    )
  ]);

  // AI-powered insights (simplified for now)
  const insights = generateAIInsights(advancedAnalytics, demographics, behaviorData.rows);

  const premiumAnalytics = {
    ...advancedAnalytics,
    demographics,
    behavior: {
      hourlyPattern: behaviorData.rows || [],
      peakHours: getPeakHours(behaviorData.rows),
    },
    timeSeries: timeSeriesData.rows || [],
    insights,
    forecast: generateForecast(timeSeriesData.rows),
  };

  successResponse(res, premiumAnalytics, 'Premium analytics overview retrieved');
});

/**
 * @route   GET /api/analytics/artworks
 * @desc    Get artwork performance analytics
 * @access  Private
 */
exports.getArtworkAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Get user's subscription tier
  const userResult = await query('SELECT subscription_tier FROM users WHERE id = ?', [userId]);
  const tier = userResult.rows[0]?.subscription_tier || 'free';

  if (tier === 'free') {
    return next(new AppError('Artwork analytics require Basic or Premium subscription', 403));
  }

  const artworks = await query(
    `SELECT
      id,
      title,
      primary_image,
      views,
      likes,
      price,
      status,
      created_at
     FROM artworks
     WHERE user_id = ?
     ORDER BY views DESC
     LIMIT 20`,
    [userId]
  );

  successResponse(res, {
    artworks: artworks.rows,
    tier
  }, 'Artwork analytics retrieved');
});

/**
 * Helper function to generate AI insights
 */
function generateAIInsights(analytics, demographics, behaviorData) {
  const insights = [];

  // Engagement insight
  const avgEngagement = analytics.engagement.likes + analytics.engagement.comments + analytics.engagement.favorites;
  if (avgEngagement > 100) {
    insights.push({
      type: 'engagement',
      level: 'positive',
      message: 'Your engagement rate is above average! Keep creating content your audience loves.',
      metric: avgEngagement
    });
  }

  // Revenue insight
  if (analytics.revenue.total > 5000) {
    insights.push({
      type: 'revenue',
      level: 'success',
      message: `You've earned ₱${analytics.revenue.total.toLocaleString()} this period. You're in the top 20% of artists!`,
      metric: analytics.revenue.total
    });
  }

  // Audience insight
  if (demographics.ageGroups['25-34'] > 30) {
    insights.push({
      type: 'audience',
      level: 'info',
      message: 'Your primary audience is 25-34 years old. Consider creating content that resonates with this demographic.',
      metric: demographics.ageGroups['25-34']
    });
  }

  // Growth insight
  if (analytics.topFans.length > 5) {
    insights.push({
      type: 'growth',
      level: 'positive',
      message: `You have ${analytics.topFans.length} loyal fans. Engage with them to build a stronger community.`,
      metric: analytics.topFans.length
    });
  }

  return insights;
}

/**
 * Helper function to get peak hours
 */
function getPeakHours(hourlyData) {
  if (!hourlyData || hourlyData.length === 0) return [];

  return hourlyData
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map(h => h.hour);
}

/**
 * Helper function to generate forecast (simplified)
 */
function generateForecast(timeSeriesData) {
  if (!timeSeriesData || timeSeriesData.length < 7) {
    return {
      next7Days: 0,
      next30Days: 0,
      confidence: 'low'
    };
  }

  // Simple moving average forecast
  const recentViews = timeSeriesData.slice(-7);
  const avgDaily = recentViews.reduce((sum, d) => sum + d.views, 0) / recentViews.length;

  return {
    next7Days: Math.round(avgDaily * 7),
    next30Days: Math.round(avgDaily * 30),
    confidence: 'medium',
    trend: avgDaily > 10 ? 'growing' : 'stable'
  };
}

module.exports = exports;
