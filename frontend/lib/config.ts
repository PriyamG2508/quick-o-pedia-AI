// Configuration for the application

export const config = {
  // Backend API URL - update this to match your backend server
  apiUrl: process.env.NEXT_PUBLIC_API_URL_NEW || 'http://localhost:8000',
  
  // App settings
  appName: 'Quick o Pedia',
  appVersion: '1.0.0',
  
  // Default settings
  defaultTopics: [
    'Machine Learning',
    'Quantum Physics', 
    'World War 2',
    'Python Programming',
    'Artificial Intelligence',
    'Climate Change',
    'Space Exploration',
    'Human Brain'
  ]
};
