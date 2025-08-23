const API_CONFIG = {
  development: {
    FLASK_API_URL: 'http://localhost:5000',
    NODE_API_URL: 'http://localhost:3001'
  },
  production: {
    FLASK_API_URL: process.env.REACT_APP_FLASK_API_URL || 'https://your-flask-app.herokuapp.com',
    NODE_API_URL: process.env.REACT_APP_NODE_API_URL || 'https://your-node-app.herokuapp.com'
  }
};

const ENV = process.env.NODE_ENV || 'development';

export const API_URLS = API_CONFIG[ENV];

// Helper function to get the correct API URL
export const getApiUrl = (service = 'flask') => {
  if (service === 'node') {
    return API_URLS.NODE_API_URL;
  }
  return API_URLS.FLASK_API_URL;
};