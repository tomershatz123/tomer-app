# Task Manager

A full-stack task management application built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

- User authentication with JWT
- Create, read, update, and delete tasks
- Task states: Not Started, In Progress, Complete
- User-specific task lists

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Custom Webpack configuration
- CSS Modules

**Backend:**
- Node.js + Express with TypeScript
- PostgreSQL database
- JWT authentication
- RESTful API

## Setup

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/tomershatz123/tomer-app.git
   cd tomer-app
```

2. Install dependencies:
```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
```

3. Set up the database:
```bash
   psql -U your_username postgres
```
   
   Then run:
```sql
   CREATE DATABASE tomerapp;
   \c tomerapp
   
   CREATE TYPE taskstate AS ENUM ('not_started', 'in_progress', 'complete');

   CREATE TYPE taskcolor AS ENUM ('red', 'blue', 'green', 'yellow', 'purple');
   
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100) UNIQUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
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
   
   INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
   INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com');
```

4. Create environment file:
   
   Create `server/.env`:
```
   PORT=5001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tomerapp
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your-secret-key-here
```

5. Run the application:
```bash
   # From root directory, run both frontend and backend:
   npm run dev
```
   
   Or run separately:
   
   **Terminal 1 - Backend:**
```bash
   cd server
   npm run dev
```
   
   **Terminal 2 - Frontend:**
```bash
   cd client
   npm start
```

   **Terminal 3 - Electron Frontend:**
```bash
   cd client
   npx electron .
```

6. Open http://localhost:3000 in your browser

## API Endpoints

### Authentication
- `POST /api/login` - Login with email

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Users
- `GET /api/users` - Get all users
- `GET /api/me` - Get current authenticated user

## License

MIT