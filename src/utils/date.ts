import { format, parse, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Format date for display in UI (DD.MM.YYYY)
 */
export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd.MM.yyyy');
  } catch {
    return '';
  }
};

/**
 * Format date for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date | string | null | undefined): string | undefined => {
  if (!date) return undefined;
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Try to parse DD.MM.YYYY format first
      dateObj = parse(date, 'dd.MM.yyyy', new Date());
      
      // If that fails, try ISO format
      if (!isValid(dateObj)) {
        dateObj = parseISO(date);
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) return undefined;
    return format(dateObj, 'yyyy-MM-dd');
  } catch {
    return undefined;
  }
};

/**
 * Parse date from DD.MM.YYYY format
 */
export const parseDisplayDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = parse(dateString, 'dd.MM.yyyy', new Date());
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Parse date from API format (YYYY-MM-DD)
 */
export const parseAPIDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Format date with time for display
 */
export const formatDateTimeForDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g., "2 дня назад")
 */
export const getRelativeTimeString = (date: Date | string): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    if (diffInDays < 7) return `${diffInDays} дней назад`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} недель назад`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} месяцев назад`;
    
    return `${Math.floor(diffInDays / 365)} лет назад`;
  } catch {
    return '';
  }
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: Date | string): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    return dateObj < new Date();
  } catch {
    return false;
  }
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
};