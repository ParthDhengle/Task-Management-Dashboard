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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragEnd = (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;

    // No destination means drag was cancelled
    if (!destination) return;

    // No change in position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    let newTasks = [...tasks];

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const columnTasks = newTasks.filter(t => t.status === source.droppableId);
      const [removed] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, removed);
      // Replace tasks in the original list
      newTasks = newTasks.map(t => (t.status === source.droppableId ? columnTasks.shift() : t));
    } else {
      // Moving to a different column
      task.status = destination.droppableId;
      newTasks = newTasks.filter(t => t.id !== draggableId);
      const destColumnTasks = newTasks.filter(t => t.status === destination.droppableId);
      destColumnTasks.splice(destination.index, 0, task);
      // Rebuild the tasks array
      newTasks = [];
      ['todo', 'in-progress', 'done'].forEach(status => {
        if (status === destination.droppableId) {
          newTasks = newTasks.concat(destColumnTasks);
        } else {
          newTasks = newTasks.concat(tasks.filter(t => t.status === status && t.id !== draggableId));
        }
      });
    }

    setTasks(newTasks);
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
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
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