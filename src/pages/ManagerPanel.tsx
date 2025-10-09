import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/MediaUpload";
import { useFormValidation, validationRules } from "@/components/FormValidation";
import { Copy, Share, Settings, AlertCircle, ArrowLeft, ExternalLink, Edit, Trash2, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { directus, ApartmentRecord, BookingRecord, DIRECTUS_URL } from "@/integrations/directus/client";
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { formatDateForAPI, formatDateForDisplay, parseAPIDate, parseDisplayDate } from "@/utils/date";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useBookings } from '@/hooks/useBookings';
import { ApartmentEditModal } from '@/components/ApartmentEditModal';
import ApartmentViewToggle from '@/components/ApartmentViewToggleUpdated';
import "@/styles/manager-mobile.css";
import "@/styles/manager-simplified.css";

const ManagerPanel = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [apartments, setApartments] = useState<Array<{ id: string; name: string; number: string; entrance_code: string | null; lock_code: string | null; wifi_password: string | null; address?: string | null; description?: string | null; building_number?: string | null; housing_complex?: string | null }>>([]);
  const [formData, setFormData] = useState({
    apartmentId: '',
    checkIn: '',
    checkOut: '',
    electronicLockCode: '',
    guestName: ''
  });
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  // Bookings list & editing
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  
  // Use React Query hook for bookings
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useBookings(formData.apartmentId || undefined);

  const [showApartmentForm, setShowApartmentForm] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<null | { id?: string }>(null);
  const [apartmentForm, setApartmentForm] = useState({
    name: '',
    number: '',
    building_number: '',
    housing_complex: '',
    address: '',
    description: '',
    wifi_password: '',
    entrance_code: '',
    lock_code: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    faq_checkin: '',
    faq_apartment: '',
    faq_area: '',
    map_embed_code: '',
    entrance_number: '',
    floor_number: ''
  });

  useEffect(() => {
    const load = async () => {
      // quick probe to see URL used (token is not logged)
      logger.debug('Directus URL:', DIRECTUS_URL);
      try {
        const items = await directus.request(readItems<ApartmentRecord>('apartments', {
          sort: ['-date_created'],
          fields: ['*'],
          limit: -1,
        }));
        const mapped = (items || []).map(a => ({
          id: a.id,
          name: a.title || '',
          number: a.apartment_number || '',
          building_number: a.building_number,
          housing_complex: a.housing_complex,
          entrance_code: a.code_building,
          lock_code: a.code_lock,
          wifi_password: a.wifi_password,
          address: a.base_address || null,
          description: a.description || null,
        }));
        const parseNum = (s?: string | null) => {
          const n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
          return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
        };
        mapped.sort((a, b) => parseNum(a.number) - parseNum(b.number));
        setApartments(mapped);
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'apartments') {
          const editId = params.get('edit');
          if (editId) {
            const toEdit = mapped.find(a => a.id === editId);
            if (toEdit) editApartment(toEdit);
          }
        }
      } catch (e) {
        logger.error('Failed to load apartments', e);
        toast({ title: 'Не удалось загрузить апартаменты из Directus', variant: 'destructive' });
      }
    };
    load();
  }, []);


  const { errors, validateForm, validateAndClearError, hasErrors, clearError } = useFormValidation(validationRules);

  const generateGuestLink = () => {
    const baseUrl = window.location.origin;
    
    // Проверяем, что apartmentId выбран
    if (!formData.apartmentId) {
      logger.debug('No apartment selected, returning base link');
      return `${baseUrl}/apartment/`;
    }
    
    const selected = apartments.find(a => a.id === formData.apartmentId);
    
    // Очистка данных перед добавлением в URL
    const cleanParams = {
      guest: formData.guestName?.trim() || '',
      checkin: formData.checkIn?.trim() || '',
      checkout: formData.checkOut?.trim() || ''
    };
    
    const params = new URLSearchParams();
    // Добавляем только непустые параметры
    if (cleanParams.guest) params.set('guest', cleanParams.guest);
    if (cleanParams.checkin) params.set('checkin', cleanParams.checkin);
    if (cleanParams.checkout) params.set('checkout', cleanParams.checkout);
    
    const lock = formData.electronicLockCode?.trim() || selected?.lock_code?.trim() || '';
    if (lock) params.set('lock', lock);
    if (selected?.entrance_code?.trim()) params.set('entrance', selected.entrance_code.trim());
    if (selected?.wifi_password?.trim()) params.set('wifi', selected.wifi_password.trim());
    
    const link = `${baseUrl}/apartment/${formData.apartmentId}?${params.toString()}`;
    logger.debug('Generated guest link:', link);
    logger.debug('Link params:', Object.fromEntries(params.entries()));
    
    return link;
  };

  const handleCopyLink = async () => {
    const link = generateGuestLink();
    
    // Проверяем поддержку современного Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Ссылка скопирована!",
          description: "Ссылка для гостя скопирована в буфер обмена",
        });
        resetGuestForm();
        return;
      } catch (error) {
        logger.error('Modern clipboard API failed:', error);
      }
    }
    
    // Fallback для старых браузеров или небезопасного контекста
    const textArea = document.createElement('textarea');
    textArea.value = link;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Пытаемся использовать старый API
      const success = document.execCommand('copy');
      if (success) {
        toast({
          title: "Ссылка скопирована!",
          description: "Ссылка для гостя скопирована в буфер обмена",
        });
        resetGuestForm();
      } else {
        throw new Error('execCommand failed');
      }
    } catch (fallbackError) {
      logger.error('Fallback clipboard method failed:', fallbackError);
      toast({
        title: "Не удалось скопировать",
        description: "Ссылка отображается в поле выше. Скопируйте её вручную",
        variant: "destructive"
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleShareLink = async () => {
    const link = generateGuestLink();
    const message = `Здравствуйте, ${formData.guestName || '[Имя гостя]'}! 🌞\nДобро пожаловать в MORENT — ваш уютный дом в Сочи 🌴\n\nМы подготовили для вас персональную страницу с важной информацией: как заселиться, как добраться и как связаться с нами 👇\n👉 ${link}\n\n✨ Там же вы найдёте список дополнительных услуг, которые сделают отдых ещё комфортнее:\n\n📦 Хранение багажа\n🚗 Парковка\n🐶 Проживание с питомцами\n🌅 Ранний заезд\n🚖 Трансфер и другое\n\nПросто напишите нам заранее, если что-то из этого будет вам нужно 💛`;
    
    // Проверяем поддержку современного Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(message);
        toast({
          title: "Сообщение готово!",
          description: "Сообщение с инструкцией скопировано в буфер обмена",
        });
        resetGuestForm();
        return;
      } catch (error) {
        logger.error('Modern clipboard API failed for message:', error);
      }
    }
    
    // Fallback для старых браузеров или небезопасного контекста
    const textArea = document.createElement('textarea');
    textArea.value = message;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const success = document.execCommand('copy');
      if (success) {
        toast({
          title: "Сообщение готово!",
          description: "Сообщение с инструкцией скопировано в буфер обмена",
        });
        resetGuestForm();
      } else {
        throw new Error('execCommand failed');
      }
    } catch (fallbackError) {
      logger.error('Fallback clipboard method failed for message:', fallbackError);
      toast({
        title: "Не удалось скопировать",
        description: "Сообщение отображается в поле выше. Скопируйте его вручную",
        variant: "destructive"
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateAndClearError(field, value);
  };

  const resetGuestForm = () => {
    setFormData({
      apartmentId: '',
      checkIn: '',
      checkOut: '',
      electronicLockCode: '',
      guestName: ''
    });
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setShowCheckInCalendar(false);
    setShowCheckOutCalendar(false);
    setEditingBookingId(null);
    if (Object.keys(errors).length) {
      Object.keys(errors).forEach(field => clearError(field));
    }
  };

  const createBooking = async () => {
    // Валидация данных
    if (!formData.apartmentId) {
      toast({ title: "Выберите апартамент", variant: "destructive" });
      return;
    }
    if (!formData.guestName.trim()) {
      toast({ title: "Введите имя гостя", variant: "destructive" });
      return;
    }
    if (!formData.checkIn) {
      toast({ title: "Выберите дату заезда", variant: "destructive" });
      return;
    }
    if (!formData.checkOut) {
      toast({ title: "Выберите дату выезда", variant: "destructive" });
      return;
    }

    // Проверка дат
    const checkInParsed = parseDisplayDate(formData.checkIn);
    const checkOutParsed = parseDisplayDate(formData.checkOut);
    
    if (!checkInParsed || !checkOutParsed) {
      toast({ title: "Неверный формат дат", description: "Используйте формат ДД.ММ.ГГГГ", variant: "destructive" });
      return;
    }

    if (checkOutParsed <= checkInParsed) {
      toast({ title: "Дата выезда должна быть позже даты заезда", variant: "destructive" });
      return;
    }

    try {
      const checkinIso = formatDateForAPI(formData.checkIn);
      const checkoutIso = formatDateForAPI(formData.checkOut);
      
      if (!checkinIso || !checkoutIso) {
        throw new Error('Ошибка преобразования дат');
      }

      let created: any | null = null;
      const variants: Array<Record<string, any>> = [
        { apartment_id: formData.apartmentId, guest_name: formData.guestName.trim(), checkin_date: checkinIso, checkout_date: checkoutIso },
        { apartment: formData.apartmentId, guest_name: formData.guestName.trim(), checkin_date: checkinIso, checkout_date: checkoutIso },
        { apartment_id: formData.apartmentId, guest_name: formData.guestName.trim(), check_in_date: checkinIso, check_out_date: checkoutIso },
        { apartment: formData.apartmentId, guest_name: formData.guestName.trim(), check_in_date: checkinIso, check_out_date: checkoutIso },
      ];

      let lastError: any;
      for (const payload of variants) {
        try {
          // strip undefined/null values to avoid validation issues
          const compact = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== ''));
          logger.debug('Trying to create booking with payload:', compact);
          created = await directus.request(createItem('bookings', compact));
          logger.debug('Booking created successfully:', created);
          break;
        } catch (err) {
          lastError = err;
          logger.debug('Variant failed:', payload, err);
        }
      }
      if (!created) throw lastError;

      await refetchBookings();

      // Просто показываем успешное сообщение без автоматического копирования
      const link = generateGuestLink();
      
      // Проверяем, что ссылка содержит необходимые данные
      const linkUrl = new URL(link);
      const linkParams = new URLSearchParams(linkUrl.search);
      const hasGuestData = linkParams.has('guest') && linkParams.has('checkin') && linkParams.has('checkout');
      
      if (!hasGuestData) {
        logger.warn('Generated link missing guest data:', link);
        toast({ 
          title: "Бронирование создано", 
          description: "Внимание: в ссылке могут отсутствовать некоторые данные гостя",
          variant: "default"
        });
      } else {
        toast({ 
          title: "Бронирование создано", 
          description: "Используйте кнопку 'Скопировать ссылку' для получения ссылки",
          variant: "default"
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['bookings'], exact: false });
      resetGuestForm();
      
    } catch (e: any) {
      // Try to surface Directus error details for easier debugging
      const details = e?.errors?.[0];
      let message = details?.message || e?.message || 'Не удалось создать бронирование';
      
      // Улучшенная обработка специфических ошибок
      if (message.includes('UNIQUE')) {
        message = 'Бронирование с такими данными уже существует';
      } else if (message.includes('FOREIGN_KEY')) {
        message = 'Выбранный апартамент не найден';
      } else if (message.includes('NOT_NULL')) {
        message = 'Не все обязательные поля заполнены';
      }
      
      logger.error('Create booking error', e);
      if (e?.response && typeof e.response.json === 'function') {
        try { e.response.json().then((j: any) => logger.error('Directus error body', j)); } catch {}
      }
      toast({ title: "Ошибка создания бронирования", description: message, variant: "destructive" });
    }
  };

  const updateBooking = async () => {
    if (!editingBookingId) return;
    
    // Валидация данных
    if (!formData.guestName.trim()) {
      toast({ title: "Введите имя гостя", variant: "destructive" });
      return;
    }
    if (!formData.checkIn) {
      toast({ title: "Выберите дату заезда", variant: "destructive" });
      return;
    }
    if (!formData.checkOut) {
      toast({ title: "Выберите дату выезда", variant: "destructive" });
      return;
    }

    // Проверка дат
    const checkInParsed = parseDisplayDate(formData.checkIn);
    const checkOutParsed = parseDisplayDate(formData.checkOut);
    
    if (!checkInParsed || !checkOutParsed) {
      toast({ title: "Неверный формат дат", description: "Используйте формат ДД.ММ.ГГГГ", variant: "destructive" });
      return;
    }

    if (checkOutParsed <= checkInParsed) {
      toast({ title: "Дата выезда должна быть позже даты заезда", variant: "destructive" });
      return;
    }

    try {
      const checkinIso = formatDateForAPI(formData.checkIn);
      const checkoutIso = formatDateForAPI(formData.checkOut);
      
      if (!checkinIso || !checkoutIso) {
        throw new Error('Ошибка преобразования дат');
      }

      const variants: Array<Record<string, any>> = [
        { guest_name: formData.guestName.trim(), checkin_date: checkinIso, checkout_date: checkoutIso },
        { guest_name: formData.guestName.trim(), check_in_date: checkinIso, check_out_date: checkoutIso },
      ];
      let success = false;
      let lastError: any;
      for (const payload of variants) {
        try {
          const compact = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== ''));
          logger.debug('Trying to update booking with payload:', compact);
          await directus.request(updateItem('bookings', editingBookingId, compact as any));
          success = true;
          break;
        } catch (err) {
          lastError = err;
          logger.debug('Update variant failed:', payload, err);
        }
      }
      if (!success) throw lastError;

      await refetchBookings();
      setEditingBookingId(null);
      
      // Очистка формы после успешного обновления
      setFormData(prev => ({
        ...prev,
        guestName: '',
        checkIn: '',
        checkOut: '',
        electronicLockCode: ''
      }));
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      
      toast({ title: 'Бронирование обновлено' });
    } catch (e: any) {
      const details = e?.errors?.[0];
      let message = details?.message || e?.message || 'Не удалось обновить бронирование';
      
      // Улучшенная обработка специфических ошибок
      if (message.includes('UNIQUE')) {
        message = 'Бронирование с такими данными уже существует';
      } else if (message.includes('NOT_NULL')) {
        message = 'Не все обязательные поля заполнены';
      }
      
      logger.error('Update booking error', e);
      toast({ title: 'Ошибка обновления', description: message, variant: 'destructive' });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Удалить бронирование?')) return;
    try {
      await directus.request(deleteItem('bookings', bookingId));
      await refetchBookings();
      toast({ title: 'Бронирование удалено' });
    } catch (e) {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  };

  const startEditBooking = (b: { id: string; apartment_id: string; guest_name: string; checkin_date?: string; checkout_date?: string; }) => {
    setEditingBookingId(b.id);
    // set apartment selection to booking's apartment for clarity
    updateFormData('apartmentId', b.apartment_id);
    // fill form fields
    setFormData(prev => ({
      ...prev,
      guestName: b.guest_name || '',
      checkIn: formatDateForDisplay(b.checkin_date),
      checkOut: formatDateForDisplay(b.checkout_date),
    }));
    // update calendar pickers
    const checkInParsed = parseAPIDate(b.checkin_date || '');
    const checkOutParsed = parseAPIDate(b.checkout_date || '');
    if (checkInParsed) setCheckInDate(checkInParsed);
    if (checkOutParsed) setCheckOutDate(checkOutParsed);
  };

  const saveApartment = async () => {
    if (!apartmentForm.name || !apartmentForm.number) {
      toast({ title: 'Заполните название и номер', variant: 'destructive' });
      return;
    }
    try {
      if (selectedApartment?.id) {
        await directus.request(updateItem('apartments', selectedApartment.id, {
          title: apartmentForm.name,
          apartment_number: apartmentForm.number,
          building_number: apartmentForm.building_number || null,
          housing_complex: apartmentForm.housing_complex || null,
          description: apartmentForm.description || null,
          base_address: apartmentForm.address || null,
          wifi_password: apartmentForm.wifi_password || null,
          code_building: apartmentForm.entrance_code || null,
          code_lock: apartmentForm.lock_code || null,
          manager_name: apartmentForm.manager_name || null,
          manager_phone: apartmentForm.manager_phone || null,
          manager_email: apartmentForm.manager_email || null,
          faq_checkin: apartmentForm.faq_checkin || null,
          faq_apartment: apartmentForm.faq_apartment || null,
          faq_area: apartmentForm.faq_area || null,
          map_embed_code: apartmentForm.map_embed_code || null,
          entrance_number: apartmentForm.entrance_number || null,
          floor_number: apartmentForm.floor_number || null,
        }));
        toast({ title: 'Апартамент обновлён' });
      } else {
        await directus.request(createItem('apartments', {
          title: apartmentForm.name,
          apartment_number: apartmentForm.number,
          building_number: apartmentForm.building_number || null,
          housing_complex: apartmentForm.housing_complex || null,
          description: apartmentForm.description || null,
          base_address: apartmentForm.address || null,
          wifi_password: apartmentForm.wifi_password || null,
          code_building: apartmentForm.entrance_code || null,
          code_lock: apartmentForm.lock_code || null,
          manager_name: apartmentForm.manager_name || null,
          manager_phone: apartmentForm.manager_phone || null,
          manager_email: apartmentForm.manager_email || null,
          faq_checkin: apartmentForm.faq_checkin || null,
          faq_apartment: apartmentForm.faq_apartment || null,
          faq_area: apartmentForm.faq_area || null,
          map_embed_code: apartmentForm.map_embed_code || null,
          entrance_number: apartmentForm.entrance_number || null,
          floor_number: apartmentForm.floor_number || null,
        }));
        toast({ title: 'Апартамент создан' });
      }
      // reload and reset
      const items = await directus.request(readItems<ApartmentRecord>('apartments', { sort: ['-date_created'] }));
      const mapped = (items || []).map(a => ({
        id: a.id,
        name: a.title || '',
        number: a.apartment_number || '',
        building_number: a.building_number,
        housing_complex: a.housing_complex,
        entrance_code: a.code_building,
        lock_code: a.code_lock,
        wifi_password: a.wifi_password,
        address: a.base_address || null,
        description: a.description || null,
      }));
      const parseNum = (s?: string | null) => {
        const n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
      };
      mapped.sort((a, b) => parseNum(a.number) - parseNum(b.number));
      setApartments(mapped);
      setShowApartmentForm(false);
      setSelectedApartment(null);
      setApartmentForm({ name: '', number: '', building_number: '', housing_complex: '', address: '', description: '', wifi_password: '', entrance_code: '', lock_code: '', manager_name: '', manager_phone: '', manager_email: '', faq_checkin: '', faq_apartment: '', faq_area: '', map_embed_code: '', entrance_number: '', floor_number: '' });
    } catch (e) {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  const editApartment = async (a: { id: string; name: string; number: string; address: string | null; wifi_password: string | null; entrance_code: string | null; lock_code: string | null; }) => {
    try {
      const full = await directus.request(readItem<ApartmentRecord>('apartments', a.id, { fields: ['*'] } as any));
      setSelectedApartment({ id: a.id });
      setApartmentForm({
        name: full.title || '',
        number: full.apartment_number || '',
        building_number: full.building_number || '',
        housing_complex: full.housing_complex || '',
        address: full.base_address || '',
        description: full.description || '',
        wifi_password: full.wifi_password || '',
        entrance_code: full.code_building || '',
        lock_code: full.code_lock || '',
        manager_name: full.manager_name || '',
        manager_phone: full.manager_phone || '',
        manager_email: full.manager_email || '',
        faq_checkin: full.faq_checkin || '',
        faq_apartment: full.faq_apartment || '',
        faq_area: full.faq_area || '',
        map_embed_code: full.map_embed_code || '',
        entrance_number: full.entrance_number || '',
        floor_number: full.floor_number || '',
      });
      setShowApartmentForm(true);
    } catch (e) {
      toast({ title: 'Не удалось загрузить данные апартамента', variant: 'destructive' });
    }
  };

  const removeApartment = async (id: string) => {
    if (!confirm('Удалить апартамент?')) return;
    try {
      await directus.request(deleteItem('apartments', id));
      setApartments(prev => {
        const parseNum = (s?: string | null) => {
          const n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
          return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
        };
        const next = prev.filter(x => x.id !== id);
        next.sort((a, b) => parseNum(a.number) - parseNum(b.number));
        return next;
      });
      toast({ title: 'Апартамент удалён' });
    } catch (e) {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  };

  const handleMassUpdate = async (apartmentIds: string[], updates: any) => {
    try {
      for (const apartmentId of apartmentIds) {
        await directus.request(updateItem('apartments', apartmentId, updates));
      }
      // Перезагрузить список апартаментов
      const items = await directus.request(readItems<ApartmentRecord>('apartments', {
        sort: ['-date_created'],
        fields: ['*'],
        limit: -1,
      }));
      const mapped = (items || []).map(a => ({
        id: a.id,
        name: a.title || '',
        number: a.apartment_number || '',
        building_number: a.building_number,
        housing_complex: a.housing_complex,
        entrance_code: a.code_building,
        lock_code: a.code_lock,
        wifi_password: a.wifi_password,
        address: a.base_address || null,
        description: a.description || null,
      }));
      const parseNum = (s?: string | null) => {
        const n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
      };
      mapped.sort((a, b) => parseNum(a.number) - parseNum(b.number));
      setApartments(mapped);
    } catch (error) {
      logger.error('Failed to mass update apartments', error);
      throw error;
    }
  };

  const handleCopySettings = async (sourceId: string, targetIds: string[], fields: string[]) => {
    try {
      const sourceApartment = await directus.request(readItem('apartments', sourceId));
      const updates: any = {};
      
      fields.forEach(field => {
        updates[field] = sourceApartment[field];
      });
      
      for (const targetId of targetIds) {
        await directus.request(updateItem('apartments', targetId, updates));
      }
      
      // Перезагрузить список апартаментов
      const items = await directus.request(readItems<ApartmentRecord>('apartments', {
        sort: ['-date_created'],
        fields: ['*'],
        limit: -1,
      }));
      const mapped = (items || []).map(a => ({
        id: a.id,
        name: a.title || '',
        number: a.apartment_number || '',
        building_number: a.building_number,
        housing_complex: a.housing_complex,
        entrance_code: a.code_building,
        lock_code: a.code_lock,
        wifi_password: a.wifi_password,
        address: a.base_address || null,
        description: a.description || null,
      }));
      const parseNum = (s?: string | null) => {
        const n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
      };
      mapped.sort((a, b) => parseNum(a.number) - parseNum(b.number));
      setApartments(mapped);
    } catch (error) {
      logger.error('Failed to copy settings', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-wave p-4 md:p-6 manager-mobile">
      <div className="max-w-6xl mx-auto">
        <Card className="p-4 md:p-8 shadow-ocean">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-none">
            <Settings className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
            <h1 className="text-lg md:text-3xl font-bold font-playfair text-primary uppercase leading-tight">Панель менеджера MORENT</h1>
          </div>
          <div className="flex items-center gap-2 manager-header-buttons w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-sm md:text-base px-2 md:px-4 flex-1 sm:flex-none justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">На главную</span>
              <span className="sm:hidden">Главная</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2 text-sm md:text-base px-2 md:px-4 flex-1 sm:flex-none justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
          </div>

          <Tabs defaultValue="guest-data" className="w-full">
            <TabsList className="grid w-full tabs-list-mobile grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 h-auto p-1">
              <TabsTrigger value="guest-data" className="flex items-center gap-2 tabs-trigger-mobile justify-center py-3">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Данные гостя</span>
                <span className="sm:hidden">Гость</span>
              </TabsTrigger>
              <TabsTrigger value="apartments" className="flex items-center gap-2 tabs-trigger-mobile justify-center py-3">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Апартаменты</span>
                <span className="sm:hidden">Квартиры</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guest-data" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-8 guest-form-grid">
                {/* Form Section */}
                <div className="space-y-4 md:space-y-6 form-section">
                  <h2 className="text-xl font-semibold font-playfair text-primary border-b border-border pb-2 uppercase">
                    Данные для гостя
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="guestName">Имя гостя</Label>
                      <Input
                        id="guestName"
                        value={formData.guestName}
                        onChange={(e) => updateFormData('guestName', e.target.value)}
                        placeholder="Иван Иванов"
                        className={errors.guestName ? "border-destructive" : ""}
                      />
                      {errors.guestName && (
                        <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.guestName}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Апартамент</Label>
                      <Select value={formData.apartmentId} onValueChange={(v) => updateFormData('apartmentId', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите апартамент" />
                        </SelectTrigger>
                        <SelectContent>
                          {apartments.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name} №{a.number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Дата заезда</Label>
                        {/* Desktop: Popover */}
                        <div className="hidden sm:block">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {checkInDate ? format(checkInDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto overflow-hidden" side="bottom" align="center" sideOffset={8}>
                              <Calendar
                                mode="single"
                                selected={checkInDate}
                                onSelect={(d) => {
                                  setCheckInDate(d);
                                  if (d) updateFormData('checkIn', format(d, 'dd.MM.yyyy'));
                                }}
                                className="w-full"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        {/* Mobile: Dialog */}
                        <div className="block sm:hidden">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2"
                            onClick={() => setShowCheckInCalendar(true)}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            {checkInDate ? format(checkInDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                          </Button>
                        </div>
                        
                        {errors.checkIn && (
                          <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.checkIn}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Дата выезда</Label>
                        {/* Desktop: Popover */}
                        <div className="hidden sm:block">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {checkOutDate ? format(checkOutDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto overflow-hidden" side="bottom" align="center" sideOffset={8}>
                              <Calendar
                                mode="single"
                                selected={checkOutDate}
                                onSelect={(d) => {
                                  setCheckOutDate(d);
                                  if (d) updateFormData('checkOut', format(d, 'dd.MM.yyyy'));
                                }}
                                className="w-full"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        {/* Mobile: Dialog */}
                        <div className="block sm:hidden">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start gap-2"
                            onClick={() => setShowCheckOutCalendar(true)}
                          >
                            <CalendarIcon className="w-4 h-4" />
                            {checkOutDate ? format(checkOutDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                          </Button>
                        </div>
                        
                        {errors.checkOut && (
                          <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.checkOut}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="lock">Код электронного замка (можно оставить пустым для кода из карточки)</Label>
                        <Input
                          id="lock"
                          value={formData.electronicLockCode}
                          onChange={(e) => updateFormData('electronicLockCode', e.target.value)}
                          placeholder="1111"
                          className={errors.electronicLockCode ? "border-destructive" : ""}
                        />
                        {errors.electronicLockCode && (
                          <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.electronicLockCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview, Actions and Bookings List */}
                <div className="space-y-4 md:space-y-6 link-section">
                  <h2 className="text-xl font-semibold font-playfair text-primary border-b border-border pb-2 uppercase">
                    Ссылка для отправки
                  </h2>

                  <Card className="p-4 bg-muted">
                    <Label className="text-sm font-medium">Ссылка для гостя:</Label>
                    <Textarea
                      value={generateGuestLink()}
                      readOnly
                      className="mt-2 h-20 resize-none"
                    />
                  </Card>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleCopyLink}
                      className="w-full bg-gradient-ocean shadow-ocean"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Скопировать ссылку
                    </Button>

                    <Button 
                      onClick={handleShareLink}
                      variant="outline"
                      className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-white"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Подготовить сообщение для гостя
                    </Button>

                    {editingBookingId ? (
                      <div className="flex gap-2">
                        <Button onClick={updateBooking} className="flex-1">Сохранить изменения</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setEditingBookingId(null)}>Отмена</Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={createBooking}
                        variant="default"
                        className="w-full"
                      >
                        Создать бронирование
                      </Button>
                    )}
                  </div>

                  <Card className="p-4 bg-accent/5 border-accent/20">
                    <h3 className="font-medium text-accent mb-2">Готовое сообщение:</h3>
                    <p className="text-sm text-foreground">
                      Здравствуйте, {formData.guestName || '[Имя гостя]'}! 🌞<br/>
                      Добро пожаловать в MORENT — ваш уютный дом в Сочи 🌴<br/><br/>
                      Мы подготовили для вас персональную страницу с важной информацией: как заселиться, как добраться и как связаться с нами 👇<br/>
                      👉 [Ссылка будет вставлена автоматически]<br/><br/>
                      ✨ Там же вы найдёте список дополнительных услуг, которые сделают отдых ещё комфортнее:<br/><br/>
                      📦 Хранение багажа<br/>
                      🚗 Парковка<br/>
                      🐶 Проживание с питомцами<br/>
                      🌅 Ранний заезд<br/>
                      🚖 Трансфер и другое<br/><br/>
                      Просто напишите нам заранее, если что-то из этого будет вам нужно 💛
                    </p>
                  </Card>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-playfair text-primary border-b border-border pb-2 uppercase">Текущие бронирования</h3>
                    <div className="grid grid-cols-1 gap-3 bookings-list">
                      {bookings.map((b) => (
                        <Card key={b.id} className="p-3 booking-item">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 booking-item-content">
                            <div className="text-left flex-1">
                              <div className="font-medium">{b.guest_name}</div>
                              <div className="text-sm text-muted-foreground">
                                <span className="block sm:inline">Заезд: {b.checkin_date || '-'}</span>
                                <span className="hidden sm:inline"> · </span>
                                <span className="block sm:inline">Выезд: {b.checkout_date || '-'}</span>
                              </div>
                            </div>
                            <div className="flex gap-1 w-full sm:w-auto booking-actions">
                              <Button variant="ghost" size="sm" onClick={() => startEditBooking(b)} className="flex-1 sm:flex-none touch-target">
                                <Edit className="w-4 h-4" />
                                <span className="ml-1 sm:hidden">Изменить</span>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteBooking(b.id)} className="flex-1 sm:flex-none touch-target">
                                <Trash2 className="w-4 h-4" />
                                <span className="ml-1 sm:hidden">Удалить</span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {bookings.length === 0 && (
                        <div className="text-sm text-muted-foreground p-4 text-center bg-muted rounded">Нет бронирований{formData.apartmentId ? ' для выбранного апартамента' : ''}.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </TabsContent>

            

            <TabsContent value="apartments" className="space-y-6 mt-6">
              <ApartmentViewToggle
                apartments={apartments}
                onEditApartment={editApartment}
                onRemoveApartment={removeApartment}
                onAddApartment={() => {
                  setSelectedApartment(null);
                  setApartmentForm({ 
                    name: '', 
                    number: '', 
                    building_number: '', 
                    housing_complex: '',
                    address: '', 
                    description: '',
                    wifi_password: '', 
                    entrance_code: '', 
                    lock_code: '',
                    manager_name: '',
                    manager_phone: '',
                    manager_email: '',
                    faq_checkin: '',
                    faq_apartment: '',
                    faq_area: '',
                    map_embed_code: '',
                    entrance_number: '',
                    floor_number: ''
                  });
                  setShowApartmentForm(true);
                }}
                onMassUpdate={handleMassUpdate}
                onCopySettings={handleCopySettings}
              />
              <ApartmentEditModal
                open={showApartmentForm}
                onOpenChange={setShowApartmentForm}
                apartmentForm={apartmentForm}
                setApartmentForm={setApartmentForm}
                selectedApartment={selectedApartment}
                onSave={saveApartment}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Mobile Calendar Dialogs */}
      <Dialog open={showCheckInCalendar} onOpenChange={setShowCheckInCalendar}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Выберите дату заезда</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={checkInDate}
            onSelect={(d) => {
              setCheckInDate(d);
              if (d) updateFormData('checkIn', format(d, 'dd.MM.yyyy'));
              setShowCheckInCalendar(false);
            }}
            className="mobile-calendar w-full"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCheckOutCalendar} onOpenChange={setShowCheckOutCalendar}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Выберите дату выезда</DialogTitle>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={checkOutDate}
            onSelect={(d) => {
              setCheckOutDate(d);
              if (d) updateFormData('checkOut', format(d, 'dd.MM.yyyy'));
              setShowCheckOutCalendar(false);
            }}
            className="mobile-calendar w-full"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerPanel;
