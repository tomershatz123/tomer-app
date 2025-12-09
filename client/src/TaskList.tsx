import React, { useState, useEffect } from 'react';
import './TaskList.css';
import { CancelIcon, DeleteIcon, EditIcon, PlusIcon } from './Icons';
import { apiGet, apiPost, apiPatch, apiDelete } from './useApi';

export type TaskState = 'not_started' | 'in_progress' | 'complete';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  state: TaskState;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}


const TaskList: React.FC = () => {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    state: 'not_started' as TaskState
  });
  
  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    state: 'not_started' as TaskState
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    
    try {
      const response = await apiGet('/api/tasks');
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
      state: task.state
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', state: 'not_started' });
  };

  const updateTask = async (id: number) => {
    try {
      const response = await apiPatch(`/api/tasks/${id}`, editForm);
  
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

    if (!newTask.title.trim()) {
      alert('Title is required');
      return;
    }
  
    try {
      const response = await apiPost('/api/tasks', newTask);
  
      if (response.ok) {
        const createdTask = await response.json();
        setTasks([createdTask, ...tasks]);
        setNewTask({ title: '', description: '', state: 'not_started' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const cancelAddTask = () => {
    setNewTask({ title: '', description: '', state: 'not_started' });
    setShowAddForm(false);
  };

  // Add delete function
  const deleteTask = async (id: number, title: string) => {
    
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
  
    try {
      const response = await apiDelete(`/api/tasks/${id}`);
  
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
      case 'not_started': return '#f44336';
      case 'in_progress': return '#ff9800';
      case 'complete': return '#4caf50';
      default: return '#999';
    }
  };

  const getStateLabel = (state: TaskState): string => {
    return state.replace('_', ' ').toUpperCase();
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
            <div className="edit-actions">
              <button onClick={createTask} className="btn-save">
                Create Task
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
            <div key={task.id} className="task-card">
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
                  <div className="edit-actions">
                    <button onClick={() => updateTask(task.id)} className="btn-save">
                      Save
                    </button>
                    <button onClick={cancelEditing} className="btn-cancel">
                      Cancel
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