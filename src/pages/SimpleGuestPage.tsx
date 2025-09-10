import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { logger } from "@/utils/logger";

const SimpleGuestPage = () => {
  const { apartmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [apartment, setApartment] = useState<any>(null);

  // Получаем параметры из URL
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('guest') || '';
  const checkIn = urlParams.get('checkin') || '';
  const checkOut = urlParams.get('checkout') || '';
  const entrance = urlParams.get('entrance') || '';
  const lock = urlParams.get('lock') || '';
  const wifi = urlParams.get('wifi') || '';

  useEffect(() => {
    // Имитируем загрузку данных
    setTimeout(() => {
      setApartment({
        id: apartmentId,
        title: `Апартамент №${Math.floor(Math.random() * 999) + 100}`,
        description: 'Уютные апартаменты в центре Сочи'
      });
      setLoading(false);
    }, 1000);
  }, [apartmentId]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Заголовок */}
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#2c5aa0', margin: '0 0 10px 0' }}>
            MORENT - Апартаменты в Сочи
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', margin: '0' }}>
            {apartment?.description || 'Добро пожаловать!'}
          </p>
        </div>

        {/* Приветствие гостя */}
        {guestName && (
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2c5aa0', margin: '0 0 10px 0' }}>
              Добро пожаловать, {guestName}!
            </h2>
            <p style={{ margin: '0', color: '#666' }}>
              Мы рады приветствовать вас в наших апартаментах
            </p>
          </div>
        )}

        {/* Информация о бронировании */}
        <div style={{
          backgroundColor: '#fff8e1',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#2c5aa0', marginTop: '0' }}>Информация о бронировании:</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {checkIn && <p><strong>Дата заезда:</strong> {checkIn}</p>}
            {checkOut && <p><strong>Дата выезда:</strong> {checkOut}</p>}
            {entrance && <p><strong>Код от подъезда:</strong> {entrance}</p>}
            {lock && <p><strong>Код электронного замка:</strong> {lock}</p>}
            {wifi && <p><strong>Wi-Fi пароль:</strong> {wifi}</p>}
          </div>
        </div>

        {/* Отладочная информация */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <h4>Отладочная информация:</h4>
          <p>Apartment ID: {apartmentId}</p>
          <p>Current URL: {window.location.href}</p>
          <p>Parameters loaded: {Object.entries({
            guestName, checkIn, checkOut, entrance, lock, wifi
          }).filter(([, value]) => value).map(([key]) => key).join(', ')}</p>
        </div>

        {/* Простая кнопка назад */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#2c5aa0',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGuestPage;