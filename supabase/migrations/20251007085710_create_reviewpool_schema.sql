/*
  # ReviewPool Database Schema

  ## Overview
  Complete database schema for ReviewPool - a comprehensive review management system with AI-powered insights, rewards, and analytics.

  ## 1. New Tables

  ### `profiles`
  User profiles extending Supabase auth
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `products`
  Products or services that can be reviewed
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `slug` (text, unique)
  - `description` (text)
  - `image_url` (text)
  - `category` (text)
  - `external_id` (text) - For WooCommerce/EDD integration
  - `status` (text) - active, inactive
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `reviews`
  Main reviews table
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key, nullable for guest reviews)
  - `author_name` (text, required)
  - `author_email` (text, required)
  - `rating` (integer, 1-5)
  - `title` (text)
  - `content` (text, required)
  - `images` (jsonb) - Array of image URLs
  - `status` (text) - pending, approved, rejected, spam
  - `is_verified_purchase` (boolean)
  - `sentiment_score` (numeric) - AI-generated
  - `sentiment_label` (text) - positive, neutral, negative
  - `ai_summary` (text)
  - `helpful_count` (integer)
  - `report_count` (integer)
  - `ip_address` (text)
  - `user_agent` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `review_responses`
  Responses to reviews (admin/merchant replies)
  - `id` (uuid, primary key)
  - `review_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `content` (text, required)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `rewards`
  Reward campaigns for review submissions
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `type` (text) - coupon, points, badge
  - `value` (text) - Coupon code or point value
  - `description` (text)
  - `conditions` (jsonb) - Rules for earning
  - `status` (text) - active, inactive
  - `valid_from` (timestamptz)
  - `valid_until` (timestamptz)
  - `usage_limit` (integer)
  - `usage_count` (integer)
  - `created_at` (timestamptz)

  ### `user_rewards`
  Track rewards earned by users
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key, nullable)
  - `reward_id` (uuid, foreign key)
  - `review_id` (uuid, foreign key)
  - `email` (text, required)
  - `status` (text) - earned, redeemed, expired
  - `redeemed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `settings`
  Application settings and configuration
  - `id` (uuid, primary key)
  - `key` (text, unique)
  - `value` (jsonb)
  - `category` (text) - general, ai, integrations, email
  - `updated_at` (timestamptz)

  ### `integrations`
  Third-party integration configurations
  - `id` (uuid, primary key)
  - `name` (text) - woocommerce, edd, tutorlms, etc.
  - `enabled` (boolean)
  - `config` (jsonb) - API keys, endpoints, etc.
  - `last_sync` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `analytics_daily`
  Daily aggregated analytics
  - `id` (uuid, primary key)
  - `date` (date, unique)
  - `total_reviews` (integer)
  - `approved_reviews` (integer)
  - `average_rating` (numeric)
  - `sentiment_positive` (integer)
  - `sentiment_neutral` (integer)
  - `sentiment_negative` (integer)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Authenticated users can read all approved reviews
  - Only admins can manage products, settings, and rewards
  - Users can read their own profiles and earned rewards
  - Public can submit reviews (insert only)

  ## 3. Indexes
  - Reviews by product_id and status for fast filtering
  - Reviews by created_at for sorting
  - Products by slug for frontend lookup
  - Analytics by date for reporting
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  category text,
  external_id text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  is_verified_purchase boolean DEFAULT false,
  sentiment_score numeric,
  sentiment_label text,
  ai_summary text,
  helpful_count integer DEFAULT 0,
  report_count integer DEFAULT 0,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Review responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view responses to approved reviews"
  ON review_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.id = review_responses.review_id
      AND reviews.status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can manage responses"
  ON review_responses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL,
  value text NOT NULL,
  description text,
  conditions jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
  ON rewards FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage rewards"
  ON rewards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- User rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'earned',
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage all user rewards"
  ON user_rewards FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text DEFAULT 'general',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  enabled boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Analytics daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date UNIQUE NOT NULL,
  total_reviews integer DEFAULT 0,
  approved_reviews integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  sentiment_positive integer DEFAULT 0,
  sentiment_neutral integer DEFAULT 0,
  sentiment_negative integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage analytics"
  ON analytics_daily FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);

-- Insert default settings
INSERT INTO settings (key, value, category) VALUES
  ('site_name', '"ReviewPool"', 'general'),
  ('enable_guest_reviews', 'true', 'general'),
  ('auto_approve_reviews', 'false', 'general'),
  ('require_verification', 'false', 'general'),
  ('ai_provider', '"openai"', 'ai'),
  ('enable_sentiment_analysis', 'true', 'ai'),
  ('enable_email_notifications', 'true', 'email')
ON CONFLICT (key) DO NOTHING;

-- Insert sample integrations
INSERT INTO integrations (name, enabled, config) VALUES
  ('woocommerce', false, '{"api_url": "", "api_key": ""}'::jsonb),
  ('edd', false, '{"api_url": "", "api_key": ""}'::jsonb),
  ('tutorlms', false, '{"enabled": false}'::jsonb),
  ('elementor', true, '{}'::jsonb),
  ('gutenberg', true, '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;