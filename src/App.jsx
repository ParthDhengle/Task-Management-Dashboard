import { useState, useMemo, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import TaskColumn from './components/TaskColumn';
import TaskModal from './components/TaskModal';
import Sidebar from './components/Sidebar';
import SearchAndFilters from './components/SearchAndFilters';
import { 
  subscribeToTasks, 
  addTask, 
  updateTask, 
  deleteTask as deleteTaskFromFirebase,
  initializeSampleData
} from './services/taskService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [isDragging, setIsDragging] = useState(false);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToTasks((newTasks) => {
      setTasks(newTasks);
      setLoading(false);
    });

    // Handle errors
    const handleError = (error) => {
      console.error('Firebase error:', error);
      setError('Failed to load tasks. Please check your internet connection.');
      setLoading(false);
    };

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Filter tasks (no sorting here)
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  // Group and sort tasks by status
  const tasksByStatus = useMemo(() => {
    const allTasks = {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
      done: filteredTasks.filter(task => task.status === 'done')
    };

    // Sort function for each column
    const sortTasks = (taskList) => {
      // Skip sorting during drag to maintain order
      if (isDragging) return taskList;
      return taskList.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case 'date':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    };

    return {
      todo: sortTasks(allTasks.todo),
      'in-progress': sortTasks(allTasks['in-progress']),
      done: sortTasks(allTasks.done),
    };
  }, [filteredTasks, sortBy, isDragging]);

  const handleDragEnd = async (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    // No destination means drag was cancelled
    if (!destination) return;

    // No change in position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    try {
      // Update task status in Firebase if moved to different column
      if (source.droppableId !== destination.droppableId) {
        await updateTask(draggableId, { status: destination.droppableId });
      }
      
      // Note: For reordering within the same column, you might want to add
      // an 'order' field to your tasks and update it accordingly
      
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await addTask(taskData);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const { id, ...taskData } = updatedTask;
      await updateTask(id, taskData);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskFromFirebase(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const handleModalSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleAddTask(taskData);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Initialize sample data (uncomment and run once to populate Firebase)
  const handleInitializeSampleData = async () => {
    try {
      await initializeSampleData();
      alert('Sample data initialized successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      alert('Failed to initialize sample data. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">
            Project Dashboard
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="mr-2" size={20} />
              Add Task
            </button>
            {/* Uncomment this button to initialize sample data */}
            {/* 
            <button
              onClick={handleInitializeSampleData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Init Sample Data
            </button>
            */}
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Task Columns */}
          <div className="flex-1">
            <DragDropContext
              onBeforeDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskColumn
                  title="To Do"
                  tasks={tasksByStatus.todo}
                  columnId="todo"
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
                <TaskColumn
                  title="In Progress"
                  tasks={tasksByStatus['in-progress']}
                  columnId="in-progress"
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
                <TaskColumn
                  title="Done"
                  tasks={tasksByStatus.done}
                  columnId="done"
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            </DragDropContext>
          </div>

          {/* Sidebar */}
          <Sidebar tasks={tasks} />
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          task={editingTask}
        />
      </div>
    </div>
  );
}

export default App;