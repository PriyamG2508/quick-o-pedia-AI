// Configuration for the application

// Debug logging - this will show in build logs
console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export const config = {
  // Backend API URL - update this to match your backend server
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
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

// More debug logging
console.log('Final config.apiUrl:', config.apiUrl);
