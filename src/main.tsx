import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mobile.css'
import './styles/scroll-fix.css'

// Временно отключаем Service Worker для устранения проблем с логированием
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(() => {
//         // Service Worker зарегистрирован успешно
//       })
//       .catch(() => {
//         // Ошибка регистрации Service Worker (игнорируем)
//       });
//   });
// }

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
