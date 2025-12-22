-- Create ENUM types
CREATE TYPE taskstate AS ENUM ('not_started', 'in_progress', 'complete');
CREATE TYPE taskcolor AS ENUM ('red', 'blue', 'green', 'yellow', 'purple');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  state taskstate DEFAULT 'not_started',
  color taskcolor DEFAULT 'blue',
  ordinal INTEGER DEFAULT 0,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_state ON tasks(state);
CREATE INDEX idx_tasks_ordinal ON tasks(ordinal);

-- Insert sample users
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com');

-- Insert sample tasks
INSERT INTO tasks (title, description, state, color, ordinal, user_id) VALUES 
  ('Welcome to your task manager', 'This is your first task!', 'not_started', 'blue', 1, 1),
  ('Set up your workspace', 'Configure your development environment', 'in_progress', 'yellow', 2, 1),
  ('Learn the features', 'Explore drag-and-drop, colors, and states', 'not_started', 'purple', 3, 1),
  ('Complete a task', 'Try marking a task as complete', 'not_started', 'green', 4, 2),
  ('Organize with colors', 'Use colors to categorize your tasks', 'not_started', 'red', 5, 2);