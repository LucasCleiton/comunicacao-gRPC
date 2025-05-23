import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Pode ser que você precise de um index.css vazio ou padrão
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);