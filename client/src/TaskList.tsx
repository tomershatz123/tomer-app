import React, { useState, useEffect } from 'react';
import { EditIcon, SaveIcon, CancelIcon, PlusIcon, DeleteIcon } from './Icons';
import { useTheme } from './ThemeContext';
import './TaskList.css';

export type TaskState = 'not_started' | 'in_progress' | 'complete';
export type TaskColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  state: TaskState;
  color: TaskColor;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

const TaskList: React.FC = () => {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    state: 'not_started' as TaskState,
    color: 'blue' as TaskColor
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    state: 'not_started' as TaskState,
    color: 'blue' as TaskColor
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      state: task.state,
      color: task.color
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', state: 'not_started', color: 'blue' });
  };

  const updateTask = async (id: number) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === id ? updatedTask : task));
        cancelEditing();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const createTask = async () => {
    const token = localStorage.getItem('token');
    
    if (!newTask.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([createdTask, ...tasks]);
        setNewTask({ title: '', description: '', state: 'not_started', color: 'blue' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const cancelAddTask = () => {
    setNewTask({ title: '', description: '', state: 'not_started', color: 'blue' });
    setShowAddForm(false);
  };

  const deleteTask = async (id: number, title: string) => {
    const token = localStorage.getItem('token');
    
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok || response.status === 204) {
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        alert('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Error deleting task');
    }
  };

  const getStateColor = (state: TaskState): string => {
    switch (state) {
      case 'not_started': return 'var(--state-not-started)';
      case 'in_progress': return 'var(--state-in-progress)';
      case 'complete': return 'var(--state-complete)';
      default: return '#999';
    }
  };

  const getStateLabel = (state: TaskState): string => {
    return state.replace('_', ' ').toUpperCase();
  };

  const getColorValue = (color: TaskColor): string => {
    // Lighter colors for light theme, darker for dark theme
    if (theme === 'light') {
      switch (color) {
        case 'red': return '#fecaca'; // very light red
        case 'blue': return '#bfdbfe'; // very light blue
        case 'green': return '#bbf7d0'; // very light green
        case 'yellow': return '#fef08a'; // very light yellow
        case 'purple': return '#e9d5ff'; // very light purple
        default: return '#bfdbfe';
      }
    } else {
      // Dark theme
      switch (color) {
        case 'red': return '#7f1d1d'; // dark red
        case 'blue': return '#1e3a8a'; // dark blue
        case 'green': return '#14532d'; // dark green
        case 'yellow': return '#713f12'; // dark yellow
        case 'purple': return '#581c87'; // dark purple
        default: return '#1e3a8a';
      }
    }
  };

  const getColorValueForPicker = (color: TaskColor): string => {
    // Vibrant colors for color picker (same in both themes)
    switch (color) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'purple': return '#a855f7';
      default: return '#3b82f6';
    }
  };

  const getColorLabel = (color: TaskColor): string => {
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-add-task"
        >
          <PlusIcon size={18} />
          {showAddForm ? ' Cancel' : ' Add Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="task-card add-task-card">
          <h3>Create New Task</h3>
          <div className="task-edit">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title *"
              className="edit-input"
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task description (optional)"
              className="edit-textarea"
              rows={3}
            />
            <select
              value={newTask.state}
              onChange={(e) => setNewTask({ ...newTask, state: e.target.value as TaskState })}
              className="edit-select"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
            <div className="color-picker">
              <label>Color:</label>
              <div className="color-options">
                {(['red', 'blue', 'green', 'yellow', 'purple'] as TaskColor[]).map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${newTask.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: getColorValueForPicker(color) }}
                    onClick={() => setNewTask({ ...newTask, color })}
                    title={getColorLabel(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
            <div className="edit-actions">
              <button onClick={createTask} className="btn-save">
                <SaveIcon size={16} />
                <span style={{ marginLeft: '6px' }}>Create Task</span>
              </button>
              <button onClick={cancelAddTask} className="btn-cancel">
                <CancelIcon size={16} />
                <span style={{ marginLeft: '6px' }}>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks found. Create your first task!</p>
      ) : (
        <div className="tasks">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="task-card colored-card"
              style={{ backgroundColor: getColorValue(task.color) }}
            >
              {editingId === task.id ? (
                // Edit Mode
                <div className="task-edit">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Task title"
                    className="edit-input"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Task description"
                    className="edit-textarea"
                    rows={3}
                  />
                  <select
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value as TaskState })}
                    className="edit-select"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                  </select>
                  <div className="color-picker">
                    <label>Color:</label>
                    <div className="color-options">
                      {(['red', 'blue', 'green', 'yellow', 'purple'] as TaskColor[]).map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${editForm.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: getColorValueForPicker(color) }}
                          onClick={() => setEditForm({ ...editForm, color })}
                          title={getColorLabel(color)}
                          aria-label={`Select ${color} color`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="edit-actions">
                    <button onClick={() => updateTask(task.id)} className="btn-save">
                      <SaveIcon size={16} />
                      <span style={{ marginLeft: '6px' }}>Save</span>
                    </button>
                    <button onClick={cancelEditing} className="btn-cancel">
                      <CancelIcon size={16} />
                      <span style={{ marginLeft: '6px' }}>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="task-view">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span 
                      className="task-state-badge" 
                      style={{ backgroundColor: getStateColor(task.state) }}
                    >
                      {getStateLabel(task.state)}
                    </span>
                  </div>
                  <p className="task-description">
                    {task.description || <em>No description</em>}
                  </p>
                  <div className="task-footer">
                    <span className="task-date">
                      Updated: {new Date(task.updated_at).toLocaleDateString()}
                    </span>
                    <div className="task-actions">
                      <button 
                        onClick={() => startEditing(task)} 
                        className="btn-edit"
                        aria-label="Edit task"
                        title="Edit task"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id, task.title)} 
                        className="btn-delete"
                        aria-label="Delete task"
                        title="Delete task"
                      >
                        <DeleteIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;