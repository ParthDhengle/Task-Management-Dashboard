import { User, TrendingUp, Calendar, Target } from 'lucide-react';

const Sidebar = ({ tasks }) => {
  const calculateProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getTasksByPriority = () => {
    const priorities = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      priorities[task.priority]++;
    });
    return priorities;
  };

  const priorityStats = getTasksByPriority();

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* User Profile Card */}
      <div className="sidebar-card">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manager Name</h3>
            <p className="text-sm text-gray-600">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="sidebar-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <TrendingUp className="mr-2" size={18} />
            Project Progress
          </h3>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{progress}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {tasks.filter(t => t.status === 'done').length} of {tasks.length} tasks completed
          </p>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="sidebar-card">
        <h3 className="font-semibold text-gray-900 flex items-center mb-4">
          <Target className="mr-2" size={18} />
          Task Statistics
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">High Priority</span>
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {priorityStats.high}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Medium Priority</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {priorityStats.medium}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Low Priority</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {priorityStats.low}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="sidebar-card">
        <h3 className="font-semibold text-gray-900 flex items-center mb-4">
          <Calendar className="mr-2" size={18} />
          Quick Actions
        </h3>
        
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
            View Calendar
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
            Generate Report
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
            Team Settings
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;