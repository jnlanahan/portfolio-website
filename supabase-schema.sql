-- Supabase Database Schema Export
-- Generated from your portfolio application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Security questions for admin recovery
CREATE TABLE IF NOT EXISTS security_questions (
    id SERIAL PRIMARY KEY,
    question_index INTEGER NOT NULL,
    hashed_answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    short_description TEXT,
    description TEXT NOT NULL,
    image TEXT,
    media_files TEXT[] DEFAULT '{}' NOT NULL,
    thumbnail_index INTEGER DEFAULT 0 NOT NULL,
    technologies TEXT[] DEFAULT '{}' NOT NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    demo_url TEXT,
    code_url TEXT,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'published' NOT NULL,
    date TIMESTAMP DEFAULT NOW() NOT NULL,
    client TEXT,
    custom_color TEXT DEFAULT '#007AFF',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Blog series table
CREATE TABLE IF NOT EXISTS blog_series (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    category TEXT,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT DEFAULT 'published' NOT NULL,
    read_time INTEGER DEFAULT 5 NOT NULL,
    date TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    series_id INTEGER REFERENCES blog_series(id),
    series_position INTEGER DEFAULT 0,
    "references" TEXT[] DEFAULT '{}' NOT NULL,
    footnotes TEXT[] DEFAULT '{}' NOT NULL,
    related_posts TEXT[] DEFAULT '{}' NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    table_of_contents TEXT,
    word_count INTEGER DEFAULT 0 NOT NULL
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Resume content table
CREATE TABLE IF NOT EXISTS resume_content (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Top 5 lists table
CREATE TABLE IF NOT EXISTS top_five_lists (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT,
    description TEXT,
    main_image TEXT,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Top 5 list items table
CREATE TABLE IF NOT EXISTS top_five_list_items (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES top_five_lists(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    link_text TEXT,
    image TEXT,
    highlight BOOLEAN DEFAULT FALSE NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chatbot documents table
CREATE TABLE IF NOT EXISTS chatbot_documents (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chatbot training sessions table
CREATE TABLE IF NOT EXISTS chatbot_training_sessions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chatbot conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_question TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chatbot training progress table
CREATE TABLE IF NOT EXISTS chatbot_training_progress (
    id SERIAL PRIMARY KEY,
    total_questions INTEGER DEFAULT 0 NOT NULL,
    last_training_date TIMESTAMP DEFAULT NOW() NOT NULL,
    documents_count INTEGER DEFAULT 0 NOT NULL
);

-- Chatbot evaluations table
CREATE TABLE IF NOT EXISTS chatbot_evaluations (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chatbot_conversations(id) NOT NULL,
    accuracy_score INTEGER NOT NULL,
    helpfulness_score INTEGER NOT NULL,
    relevance_score INTEGER NOT NULL,
    clarity_score INTEGER NOT NULL,
    overall_score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}' NOT NULL,
    improvements TEXT[] DEFAULT '{}' NOT NULL,
    evaluated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chatbot_conversations(id) NOT NULL,
    session_id TEXT NOT NULL,
    rating TEXT NOT NULL,
    comment TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Chatbot learning insights table
CREATE TABLE IF NOT EXISTS chatbot_learning_insights (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    insight TEXT NOT NULL,
    examples TEXT[] DEFAULT '{}' NOT NULL,
    source_evaluation_id INTEGER REFERENCES chatbot_evaluations(id),
    importance INTEGER DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- System prompt template table
CREATE TABLE IF NOT EXISTS system_prompt_template (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'default',
    template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Response formatting rules table
CREATE TABLE IF NOT EXISTS response_formatting_rules (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE DEFAULT 'default',
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Carousel images table
CREATE TABLE IF NOT EXISTS carousel_images (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    image_path TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_series ON blog_posts(series_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_session ON user_feedback(session_id);

-- Add any initial data or constraints as needed
-- Note: You'll need to manually insert your admin user with a hashed password