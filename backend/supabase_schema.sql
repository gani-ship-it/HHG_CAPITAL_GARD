-- ========================================================
-- CAPITAL GUARD: SUPABASE DATABASE INITIALIZATION SCHEMA
-- ========================================================

-- 1. Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
    id BIGSERIAL PRIMARY KEY,
    org_name VARCHAR(255) DEFAULT 'Institutional Client',
    org_type VARCHAR(100) DEFAULT 'Bank',
    total_capital DOUBLE PRECISION NOT NULL DEFAULT 1000000000.0,
    currency VARCHAR(10) DEFAULT 'INR',
    investment_horizon_years INTEGER DEFAULT 3,
    investment_objective VARCHAR(50) DEFAULT 'Balanced Growth',
    risk_preference VARCHAR(50) DEFAULT 'Medium',
    min_liquidity DOUBLE PRECISION DEFAULT 200000000.0,
    max_risk_limit DOUBLE PRECISION DEFAULT 0.07,
    selected_assets_json TEXT DEFAULT '[]',
    constraints_json TEXT DEFAULT '{}',
    current_weights_json TEXT DEFAULT '{}',
    expected_return DOUBLE PRECISION DEFAULT 0.0,
    current_risk DOUBLE PRECISION DEFAULT 0.0,
    current_liquidity DOUBLE PRECISION DEFAULT 0.0,
    health_score DOUBLE PRECISION DEFAULT 100.0,
    status VARCHAR(20) DEFAULT 'SAFE',
    user_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Decision History Table (Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS decision_history (
    id BIGSERIAL PRIMARY KEY,
    portfolio_id BIGINT REFERENCES portfolios(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger VARCHAR(100) DEFAULT 'VaR / Volatility limit breach',
    w_current_json TEXT NOT NULL,
    w_target_json TEXT NOT NULL,
    turnover DOUBLE PRECISION DEFAULT 0.0,
    transaction_cost DOUBLE PRECISION DEFAULT 0.0,
    risk_reduction_value DOUBLE PRECISION DEFAULT 0.0,
    decision VARCHAR(20) NOT NULL, -- 'REBALANCE' or 'HOLD'
    portfolio_risk_before DOUBLE PRECISION DEFAULT 0.0,
    portfolio_risk_after DOUBLE PRECISION DEFAULT 0.0,
    explanation TEXT DEFAULT ''
);

-- 3. User Profiles Table (Onboarding & Identity)
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    org_name VARCHAR(255) NOT NULL,
    org_type VARCHAR(100) DEFAULT 'Bank',
    role VARCHAR(100) DEFAULT 'Chief Risk Officer',
    purpose TEXT DEFAULT 'Basel III Regulatory Capital Defense',
    investment_horizon VARCHAR(50) DEFAULT '3-5 Years',
    risk_tolerance VARCHAR(50) DEFAULT 'Balanced',
    regulatory_framework VARCHAR(100) DEFAULT 'Basel III & RBI Guidelines',
    primary_assets_json TEXT DEFAULT '["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"]',
    initial_capital DOUBLE PRECISION DEFAULT 1000000000.0,
    currency VARCHAR(10) DEFAULT 'INR',
    onboarding_completed INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Market Cache Table
CREATE TABLE IF NOT EXISTS market_cache (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(50) UNIQUE NOT NULL,
    data_json TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime replication for live breach alerts
ALTER PUBLICATION supabase_realtime ADD TABLE portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE decision_history;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_email ON portfolios(user_email);
CREATE INDEX IF NOT EXISTS idx_decision_history_portfolio ON decision_history(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_decision_history_user_email ON decision_history(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_market_cache_symbol ON market_cache(symbol);

