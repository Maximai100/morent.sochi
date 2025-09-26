import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useScrollFix } from "@/hooks/useScrollFix";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const CheckinGuide = lazy(() => import("./pages/CheckinGuide"));
const ManagerPanel = lazy(() => import("./pages/ManagerPanel"));
const ApartmentLanding = lazy(() => import("./pages/ApartmentLanding"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Загрузка...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const AppContent = () => {
  useScrollFix(); // Применяем исправления скроллинга
  
  // Проверка версии приложения при загрузке (только один раз в день)
  React.useEffect(() => {
    const checkVersion = async () => {
      try {
        const lastCheck = localStorage.getItem('last_version_check');
        const now = Date.now();
        
        // Проверяем версию только раз в день
        if (lastCheck && (now - parseInt(lastCheck)) < 86400000) {
          return;
        }
        
        const response = await fetch('/version.json?t=' + now);
        const versionData = await response.json();
        const currentVersion = localStorage.getItem('app_version');
        
        if (currentVersion && currentVersion !== versionData.version) {
          console.log('New version detected');
          localStorage.setItem('app_version', versionData.version);
        } else if (!currentVersion) {
          localStorage.setItem('app_version', versionData.version);
        }
        
        localStorage.setItem('last_version_check', now.toString());
      } catch (error) {
        console.warn('Could not check app version:', error);
      }
    };
    
    checkVersion();
  }, []);
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manager" element={
              <ProtectedRoute>
                <ManagerPanel />
              </ProtectedRoute>
            } />
            <Route path="/guide" element={<CheckinGuide />} />
            <Route path="/apartment/:apartmentId" element={<ApartmentLanding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
