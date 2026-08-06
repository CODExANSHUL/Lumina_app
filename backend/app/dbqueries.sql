CREATE TABLE users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    mobile VARCHAR(20) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM('ADMIN','USER') DEFAULT 'USER',

    status ENUM('ACTIVE','INACTIVE','BLOCKED')
        DEFAULT 'ACTIVE',

    verified_status ENUM('VERIFIED','UNVERIFIED')
        DEFAULT 'VERIFIED',

    enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (

    profile_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    display_name VARCHAR(100) NOT NULL,

    avatar_name VARCHAR(255),

    language_preference VARCHAR(50),

    age_rating_preference VARCHAR(20),

    default_profile BOOLEAN DEFAULT FALSE,

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


CREATE TABLE categories (

    category_id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) UNIQUE,

    description TEXT,

    status ENUM('ACTIVE','INACTIVE')
        DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE videos (

    video_id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    content_type ENUM(
        'MOVIE',
        'WEB_SERIES',
        'DOCUMENTARY',
        'TRAILER'
    ),

    release_year INT,

    duration_minutes INT,

    language VARCHAR(50),

    age_rating ENUM(
        'ALL',
        'KIDS',
        'TEEN',
        'ADULT'
    ),

    thumbnail_name VARCHAR(255),

    banner_name VARCHAR(255),

    trailer_url VARCHAR(500),

    video_url VARCHAR(500),

    uploaded_by INT,

    premium BOOLEAN DEFAULT FALSE,

    featured BOOLEAN DEFAULT FALSE,

    total_views INT DEFAULT 0,

    total_likes INT DEFAULT 0,

    status ENUM(
        'DRAFT',
        'PUBLISHED',
        'REMOVED'
    ) DEFAULT 'DRAFT',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(uploaded_by)
        REFERENCES users(user_id)
);

CREATE TABLE video_categories (

    id INT AUTO_INCREMENT PRIMARY KEY,

    video_id INT,

    category_id INT,

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE,

    FOREIGN KEY(category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);

CREATE TABLE seasons (

    season_id INT AUTO_INCREMENT PRIMARY KEY,

    video_id INT NOT NULL,

    season_number INT,

    title VARCHAR(255),

    description TEXT,

    release_year INT,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE',

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE
);

CREATE TABLE episodes (

    episode_id INT AUTO_INCREMENT PRIMARY KEY,

    season_id INT,

    episode_number INT,

    title VARCHAR(255),

    description TEXT,

    duration_minutes INT,

    thumbnail_name VARCHAR(255),

    video_url VARCHAR(500),

    release_date DATE,

    status ENUM(
        'DRAFT',
        'PUBLISHED',
        'REMOVED'
    ) DEFAULT 'DRAFT',

    FOREIGN KEY(season_id)
        REFERENCES seasons(season_id)
        ON DELETE CASCADE
);

CREATE TABLE subscription_plans (

    plan_id INT AUTO_INCREMENT PRIMARY KEY,

    plan_name VARCHAR(100),

    description TEXT,

    price DECIMAL(10,2),

    duration_days INT,

    max_screens INT,

    video_quality ENUM(
        'SD',
        'HD',
        'FULL_HD',
        'UHD'
    ),

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) DEFAULT 'ACTIVE'
);


CREATE TABLE subscriptions (

    subscription_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    plan_id INT,

    start_date DATETIME,

    end_date DATETIME,

    subscription_status ENUM(
        'ACTIVE',
        'CANCELLED',
        'EXPIRED'
    ),

    auto_renew BOOLEAN,

    FOREIGN KEY(user_id)
        REFERENCES users(user_id),

    FOREIGN KEY(plan_id)
        REFERENCES subscription_plans(plan_id)
);


CREATE TABLE payments (

    payment_id INT AUTO_INCREMENT PRIMARY KEY,

    subscription_id INT,

    user_id INT,

    amount DECIMAL(10,2),

    payment_method ENUM(
        'CARD',
        'UPI',
        'NETBANKING'
    ),

    payment_status ENUM(
        'SUCCESS',
        'FAILED',
        'PENDING'
    ),

    transaction_id VARCHAR(255),

    payment_date TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(subscription_id)
        REFERENCES subscriptions(subscription_id),

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)
);


CREATE TABLE reviews (

    review_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    rating INT,

    comment TEXT,

    status ENUM(
        'VISIBLE',
        'HIDDEN'
    ) DEFAULT 'VISIBLE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id),

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
);

CREATE TABLE watchlists (

    watchlist_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id)
        ON DELETE CASCADE,

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
        ON DELETE CASCADE
);


CREATE TABLE watch_history (

    history_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    episode_id INT,

    watched_seconds INT,

    total_seconds INT,

    completed BOOLEAN,

    last_watched_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id),

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id),

    FOREIGN KEY(episode_id)
        REFERENCES episodes(episode_id)
);


CREATE TABLE video_likes (

    like_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    liked BOOLEAN DEFAULT TRUE,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id),

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
);


CREATE TABLE streaming_sessions (

    session_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    episode_id INT,

    device_name VARCHAR(100),

    ip_address VARCHAR(50),

    session_status ENUM(
        'ACTIVE',
        'ENDED'
    ),

    started_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    ended_at DATETIME,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id),

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id),

    FOREIGN KEY(episode_id)
        REFERENCES episodes(episode_id)
);


CREATE TABLE notifications (

    notification_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    notification_type ENUM(
        'SUBSCRIPTION',
        'SYSTEM'
    ),

    message VARCHAR(500),

    status ENUM(
        'UNREAD',
        'READ'
    ) DEFAULT 'UNREAD',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(user_id)
);


CREATE TABLE search_history (

    search_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    search_text VARCHAR(255),

    searched_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id)
);


CREATE TABLE video_shares (

    share_id INT AUTO_INCREMENT PRIMARY KEY,

    profile_id INT,

    video_id INT,

    platform VARCHAR(50),

    share_url VARCHAR(500),

    shared_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(profile_id)
        REFERENCES user_profiles(profile_id),

    FOREIGN KEY(video_id)
        REFERENCES videos(video_id)
);


CREATE INDEX idx_user_email
ON users(email);

CREATE INDEX idx_video_title
ON videos(title);

CREATE INDEX idx_video_language
ON videos(language);

CREATE INDEX idx_video_category
ON video_categories(category_id);

CREATE INDEX idx_watch_history
ON watch_history(profile_id);

CREATE INDEX idx_subscription_user
ON subscriptions(user_id);

CREATE INDEX idx_review_video
ON reviews(video_id);

CREATE INDEX idx_notification_user
ON notifications(user_id);

CREATE INDEX idx_search_history
ON search_history(profile_id);

CREATE INDEX idx_watchlist_profile
ON watchlists(profile_id);

