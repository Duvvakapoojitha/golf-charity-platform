-- Golf Charity Subscription Platform Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    charity_id UUID,
    donation_percentage INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Charities
CREATE TABLE charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    website VARCHAR(500),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL, -- MONTHLY, YEARLY
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE, EXPIRED
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    renewal_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scores
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    score_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Draws
CREATE TABLE draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date TIMESTAMP NOT NULL,
    draw_type VARCHAR(20) NOT NULL DEFAULT 'RANDOM', -- RANDOM, ALGORITHM
    numbers INTEGER[] NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SIMULATED, PUBLISHED
    jackpot_amount DECIMAL(10,2) DEFAULT 0,
    four_match_amount DECIMAL(10,2) DEFAULT 0,
    three_match_amount DECIMAL(10,2) DEFAULT 0,
    rollover_amount DECIMAL(10,2) DEFAULT 0,
    total_prize_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Winners
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES draws(id),
    user_id UUID NOT NULL REFERENCES users(id),
    match_count INTEGER NOT NULL,
    prize_amount DECIMAL(10,2) NOT NULL,
    charity_donation DECIMAL(10,2) DEFAULT 0,
    net_prize DECIMAL(10,2),
    proof_url VARCHAR(500),
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, PAID
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add FK for users -> charities
ALTER TABLE users ADD CONSTRAINT fk_users_charity FOREIGN KEY (charity_id) REFERENCES charities(id);

-- Indexes
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_created_at ON scores(created_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
