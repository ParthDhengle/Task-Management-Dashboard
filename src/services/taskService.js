import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  query
} from 'firebase/firestore';
import { db } from '../firebase/config';

const TASKS_COLLECTION = 'tasks';

// Get all tasks (real-time listener)
export const subscribeToTasks = (callback) => {
  const tasksQuery = query(
    collection(db, TASKS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to date string if needed
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString().split('T')[0] || doc.data().createdAt
    }));
    callback(tasks);
  });
};

// Get all tasks (one-time fetch)
export const getAllTasks = async () => {
  try {
    const tasksQuery = query(
      collection(db, TASKS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString().split('T')[0] || doc.data().createdAt
    }));
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Add a new task
export const addTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Initialize sample data (run this once to populate your Firestore)
export const initializeSampleData = async () => {
  const sampleTasks = [
    {
      title: 'Design Homepage Layout',
      description: 'Create wireframes and mockups for the new homepage design with modern UI elements',
      status: 'todo',
      priority: 'high',
      createdAt: '2024-01-15'
    },
    {
      title: 'Setup Database Schema',
      description: 'Design and implement the database structure for user management and task storage',
      status: 'todo',
      priority: 'medium',
      createdAt: '2024-01-14'
    },
    {
      title: 'Implement Authentication',
      description: 'Add user login and registration functionality with JWT tokens',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-13'
    },
    {
      title: 'Write API Documentation',
      description: 'Document all REST API endpoints with examples and response formats',
      status: 'in-progress',
      priority: 'low',
      createdAt: '2024-01-12'
    },
    {
      title: 'Setup CI/CD Pipeline',
      description: 'Configure automated testing and deployment pipeline using GitHub Actions',
      status: 'done',
      priority: 'medium',
      createdAt: '2024-01-10'
    },
    {
      title: 'Code Review Process',
      description: 'Establish code review guidelines and implement pull request templates',
      status: 'done',
      priority: 'low',
      createdAt: '2024-01-08'
    }
  ];

  try {
    for (const task of sampleTasks) {
      await addDoc(collection(db, TASKS_COLLECTION), task);
    }
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};