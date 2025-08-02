import { useState, useMemo } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import TaskColumn from './components/TaskColumn';
import TaskModal from './components/TaskModal';
import Sidebar from './components/Sidebar';
import SearchAndFilters from './components/SearchAndFilters';
import { sampleTasks } from './data/sampleTasks';

function App() {
  const [tasks, setTasks] = useState(sampleTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchTerm, priorityFilter, sortBy]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      todo: filteredAndSortedTasks.filter(task => task.status === 'todo'),
      'in-progress': filteredAndSortedTasks.filter(task => task.status === 'in-progress'),
      done: filteredAndSortedTasks.filter(task => task.status === 'done')
    };
  }, [filteredAndSortedTasks]);

const handleDragEnd = (result) => {
  console.log('Drag end called', result);
  const { destination, source, draggableId } = result;
  if (!destination) {
    console.log('No destination');
    return;
  }
  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    console.log('Same position');
    return;
  }
  console.log('Moving task', draggableId, 'from', source.droppableId, 'to', destination.droppableId);
  setTasks(prevTasks => {
    const newTasks = [...prevTasks];
    const taskIndex = newTasks.findIndex(task => task.id === draggableId);
    if (taskIndex !== -1) {
      newTasks[taskIndex].status = destination.droppableId;
    }
    return newTasks;
  });
};

  const handleAddTask = (taskData) => {
    setTasks(prevTasks => [...prevTasks, taskData]);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 lg:mb-0">
            Project Dashboard
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="mr-2" size={20} />
            Add Task
          </button>
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskColumn title="To Do" tasks={tasksByStatus.todo} columnId="todo" onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
                <TaskColumn title="In Progress" tasks={tasksByStatus['in-progress']} columnId="in-progress" onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
                <TaskColumn title="Done" tasks={tasksByStatus.done} columnId="done" onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />
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