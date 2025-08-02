import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

const TaskColumn = ({ title, tasks, columnId, onEditTask, onDeleteTask }) => {
  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'todo':
        return 'border-blue-200 bg-blue-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      case 'done':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className={`column-header ${getColumnColor(columnId)}`}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px]">
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onEdit={onEditTask} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskColumn;