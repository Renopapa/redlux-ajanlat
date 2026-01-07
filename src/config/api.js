// API URL konfiguráció
// Production: Render.com URL
// Development: localhost vagy környezeti változó

const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://redlux-ajanlat.onrender.com/api'
    : 'http://localhost:5000/api');

export default API_URL;


