import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from './db';
import { User, Task, TaskColor } from './types';
import { authenticateToken, AuthRequest, generateToken } from './auth';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tomer-app.onrender.com'
  ],
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Login route - NO authentication required
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.cookie('token', token, {
      httpOnly: true,        // Prevents JavaScript access (XSS protection)
      secure: true,          // Only sent over HTTPS in production
      sameSite: 'strict',    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000  // 24 hours
    });

    // Return token and user info
    res.json({
      successs: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Example: Get current user info (protected route)
app.get('/api/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query<User>(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tasks routes to be protected and filter by user
app.get('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Get only tasks for the logged-in user
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY ordinal ASC, created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, state, color } = req.body;

    // Get the max ordinal for this user
    const maxOrdinalResult = await pool.query(
      'SELECT COALESCE(MAX(ordinal), 0) as max_ordinal FROM tasks WHERE user_id = $1',
      [req.userId]
    );
    const nextOrdinal = maxOrdinalResult.rows[0].max_ordinal + 1;
    
    // Automatically use the authenticated user's ID
    const result = await pool.query<Task>(
      'INSERT INTO tasks (title, description, state, color, ordinal, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, state || 'not_started', color || 'blue', nextOrdinal, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder tasks
app.patch('/api/tasks/reorder', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskIds } = req.body; // Array of task IDs in new order
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'Invalid task IDs array' });
    }
    
    // Update ordinal for each task
    const updatePromises = taskIds.map((taskId, index) => 
      pool.query(
        'UPDATE tasks SET ordinal = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        [index + 1, taskId, req.userId]
      )
    );
    
    await Promise.all(updatePromises);
    
    // Return updated tasks
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY ordinal ASC',
      [req.userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.patch('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, state, color } = req.body;

    // Validate color if provided
    const validColors: TaskColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
    if (color !== undefined && !validColors.includes(color)) {
      return res.status(400).json({ 
        error: `Invalid color. Must be one of: ${validColors.join(', ')}` 
      });
    }
    
    // Build dynamic query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    
    if (state !== undefined) {
      updates.push(`state = $${paramCount}`);
      values.push(state);
      paramCount++;
    }

    if (color !== undefined) {
      updates.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(req.userId); // Add user_id for security check
    
    // Only allow updating tasks that belong to the user
    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;
    
    const result = await pool.query<Task>(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    
    // Only allow deleting tasks that belong to the user
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, req.userId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Keep other routes unchanged (users routes can stay unprotected for now)
// ... rest of your existing routes ...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});