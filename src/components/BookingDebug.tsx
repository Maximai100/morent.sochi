import React, { useState } from 'react';
import { bookingService } from '@/services/bookings.service';
import { logger } from '@/utils/logger';

export const BookingDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const testBookingOperations = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Тест 1: Загрузка всех бронирований
      logger.info('Testing getAll bookings...');
      const allBookings = await bookingService.getAll();
      results.allBookings = allBookings;
      logger.info('All bookings loaded:', allBookings);
    } catch (error: any) {
      results.allBookingsError = {
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
      logger.error('Failed to load all bookings', error);
    }

    try {
      // Тест 2: Загрузка бронирований с фильтром по апартаменту
      logger.info('Testing bookings with apartment filter...');
      const filteredBookings = await bookingService.getAll('test-apartment-id');
      results.filteredBookings = filteredBookings;
      logger.info('Filtered bookings loaded:', filteredBookings);
    } catch (error: any) {
      results.filteredBookingsError = {
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
      logger.error('Failed to load filtered bookings', error);
    }

    try {
      // Тест 3: Создание тестового бронирования
      logger.info('Testing booking creation...');
      const testBooking = await bookingService.create({
        guest_name: 'Test Guest',
        apartment_id: 'test-apartment-id',
        checkin_date: '2024-01-15',
        checkout_date: '2024-01-20',
        lock_code: '1234'
      });
      results.createdBooking = testBooking;
      logger.info('Test booking created:', testBooking);
    } catch (error: any) {
      results.createBookingError = {
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
      logger.error('Failed to create test booking', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Booking Operations Debug</h2>
      
      {/* Кнопка тестирования */}
      <div className="mb-6">
        <button
          onClick={testBookingOperations}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Booking Operations'}
        </button>
      </div>

      {/* Результаты тестов */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Анализ проблемы */}
      <div className="text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Problem Analysis:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Create works:</strong> Бронирования создаются успешно</li>
          <li><strong>Read fails:</strong> Загрузка бронирований не работает</li>
          <li><strong>Possible causes:</strong></li>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Неправильные разрешения на чтение коллекции bookings</li>
            <li>Проблемы с токеном доступа</li>
            <li>Коллекция bookings не существует</li>
            <li>Неправильная структура данных</li>
          </ul>
        </ul>
      </div>

      {/* Рекомендации */}
      <div className="mt-4 text-sm text-blue-600">
        <h4 className="font-semibold mb-2">Recommended Actions:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Проверьте разрешения для коллекции bookings в Directus</li>
          <li>Убедитесь, что роль Public имеет права на чтение</li>
          <li>Проверьте, что коллекция bookings существует</li>
          <li>Проверьте структуру полей в коллекции</li>
        </ol>
      </div>
    </div>
  );
};

export default BookingDebug;
