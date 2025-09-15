import React, { useState, useEffect } from 'react';
import { directus, DIRECTUS_URL, DIRECTUS_STATIC_TOKEN } from '@/integrations/directus/client';
import { bookingService } from '@/services/bookings.service';
import { logger } from '@/utils/logger';

export const DirectusDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Собираем информацию о конфигурации
    setDebugInfo({
      directusUrl: DIRECTUS_URL || 'Not configured',
      hasToken: !!DIRECTUS_STATIC_TOKEN,
      tokenLength: DIRECTUS_STATIC_TOKEN?.length || 0,
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV,
    });
  }, []);

  const testDirectusConnection = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Проверяем, настроен ли Directus
      if (!DIRECTUS_URL) {
        results.error = 'Directus URL is not configured';
        setTestResults(results);
        setIsLoading(false);
        return;
      }

      // Тест 1: Проверка подключения к Directus
      logger.info('Testing Directus connection...');
      const serverInfo = await directus.request({
        method: 'GET',
        path: '/server/info',
      });
      results.serverInfo = serverInfo;
      logger.info('Directus server info:', serverInfo);
    } catch (error: any) {
      results.serverError = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errors: error.errors
      };
      logger.error('Failed to connect to Directus server', error);
    }

    try {
      // Тест 2: Проверка коллекции bookings
      logger.info('Testing bookings collection...');
      const bookings = await directus.request({
        method: 'GET',
        path: '/bookings',
        params: {
          limit: 5,
        },
      });
      results.bookings = bookings;
      logger.info('Bookings found:', bookings);
    } catch (error: any) {
      results.bookingsError = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errors: error.errors,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.response.url
        } : null
      };
      logger.error('Failed to fetch bookings', error);
    }

    try {
      // Тест 3: Проверка через сервис
      logger.info('Testing booking service...');
      const serviceBookings = await bookingService.getAll();
      results.serviceBookings = serviceBookings;
      logger.info('Service bookings:', serviceBookings);
    } catch (error: any) {
      results.serviceError = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errors: error.errors,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.response.url
        } : null
      };
      logger.error('Failed to fetch bookings via service', error);
    }

    try {
      // Тест 4: Проверка коллекций
      logger.info('Testing collections...');
      const collections = await directus.request({
        method: 'GET',
        path: '/collections',
      });
      results.collections = collections;
      logger.info('Collections found:', collections);
    } catch (error: any) {
      results.collectionsError = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errors: error.errors
      };
      logger.error('Failed to fetch collections', error);
    }

    try {
      // Тест 5: Проверка разрешений для bookings
      logger.info('Testing bookings permissions...');
      const permissions = await directus.request({
        method: 'GET',
        path: '/permissions',
        params: {
          'filter[collection][_eq]': 'bookings'
        },
      });
      results.bookingsPermissions = permissions;
      logger.info('Bookings permissions:', permissions);
    } catch (error: any) {
      results.permissionsError = {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        errors: error.errors
      };
      logger.error('Failed to fetch permissions', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Directus Debug Information</h2>
      
      {/* Конфигурация */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Configuration</h3>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>

      {/* Кнопка тестирования */}
      <div className="mb-6">
        <button
          onClick={testDirectusConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Directus Connection'}
        </button>
      </div>

      {/* Результаты тестов */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div className="text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if DIRECTUS_URL is set correctly</li>
          <li>Check if DIRECTUS_STATIC_TOKEN is set correctly</li>
          <li>Verify Directus server is running and accessible</li>
          <li>Check if bookings collection exists in Directus</li>
          <li>Verify token has proper permissions</li>
        </ol>
      </div>
    </div>
  );
};

export default DirectusDebug;
