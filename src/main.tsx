import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mobile.css'
import './styles/scroll-fix.css'

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Обработка ошибок приложения
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Проверяем, что root элемент существует
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Ошибка загрузки приложения</h1><p>Не удалось найти корневой элемент</p></div>';
} else {
  createRoot(rootElement).render(<App />);
}
