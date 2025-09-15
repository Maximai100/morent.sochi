import { useEffect } from 'react';

/**
 * Hook для исправления проблем со скроллингом в PWA и мобильных браузерах
 */
export const useScrollFix = () => {
  useEffect(() => {
    // Предотвращение горизонтального скроллинга
    const preventHorizontalScroll = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Предотвращение зума при двойном тапе
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Добавляем обработчики событий
    document.addEventListener('touchstart', preventHorizontalScroll, { passive: false });
    document.addEventListener('touchmove', preventHorizontalScroll, { passive: false });
    document.addEventListener('touchstart', preventZoom, { passive: false });

    // Исправление высоты viewport для iOS Safari
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Предотвращение bounce scrolling на iOS
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as Element;
      const scrollableParent = target.closest('[data-scrollable]') || document.body;
      
      if (scrollableParent === document.body) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        
        if (scrollTop === 0 && e.touches[0].clientY > e.touches[0].targetY) {
          e.preventDefault();
        }
        
        if (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < e.touches[0].targetY) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('touchmove', preventBounce, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', preventHorizontalScroll);
      document.removeEventListener('touchmove', preventHorizontalScroll);
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventBounce);
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
};

export default useScrollFix;
