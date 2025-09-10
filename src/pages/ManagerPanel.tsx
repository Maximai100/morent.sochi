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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { formatDateForAPI, formatDateForDisplay, parseAPIDate, parseDisplayDate } from "@/utils/date";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ManagerPanel = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [apartments, setApartments] = useState<Array<{ id: string; name: string; number: string; entrance_code: string | null; lock_code: string | null; wifi_password: string | null; address?: string | null; description?: string | null }>>([]);
  const [formData, setFormData] = useState({
    apartmentId: '',
    checkIn: '',
    checkOut: '',
    electronicLockCode: '',
    guestName: ''
  });
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

  // Bookings list & editing
  const [bookings, setBookings] = useState<Array<{ id: string; apartment_id: string; guest_name: string; check_in_date?: string; check_out_date?: string }>>([]);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  const [showApartmentForm, setShowApartmentForm] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<null | { id?: string }>(null);
  const [apartmentForm, setApartmentForm] = useState({
    name: '',
    number: '',
    description: '',
    address: '',
    wifi_password: '',
    entrance_code: '',
    lock_code: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    faq_checkin: '',
    faq_apartment: '',
    faq_area: '',
    map_embed_code: ''
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

  // Load bookings on mount and when selected apartment changes
  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.apartmentId]);

  const loadBookings = async () => {
    try {
      const filter = formData.apartmentId ? { apartment_id: { _eq: formData.apartmentId } } as any : undefined;
      const items = await directus.request(readItems<BookingRecord>('bookings', {
        sort: ['-date_created'],
        filter,
        limit: 50,
      }));
      const mapped = (items || []).map((b: any) => ({
        id: b.id,
        apartment_id: b.apartment_id || b.apartment,
        guest_name: b.guest_name || '',
        check_in_date: b.checkin_date || b.check_in_date || '',
        check_out_date: b.checkout_date || b.check_out_date || '',
      }));
      setBookings(mapped);
    } catch (e) {
      // ignore silently to not break UI
    }
  };

  const { errors, validateForm, validateAndClearError, hasErrors } = useFormValidation(validationRules);

  const generateGuestLink = () => {
    const baseUrl = window.location.origin;
    const selected = apartments.find(a => a.id === formData.apartmentId);
    const params = new URLSearchParams({
      guest: formData.guestName,
      checkin: formData.checkIn,
      checkout: formData.checkOut
    });
    const lock = formData.electronicLockCode || selected?.lock_code || '';
    if (lock) params.set('lock', lock);
    if (selected?.entrance_code) params.set('entrance', selected.entrance_code);
    if (selected?.wifi_password) params.set('wifi', selected.wifi_password);
    return `${baseUrl}/apartment/${formData.apartmentId}?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const link = generateGuestLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Ссылка скопирована!",
      description: "Ссылка для гостя скопирована в буфер обмена",
    });
  };

  const handleShareLink = () => {
    const link = generateGuestLink();
    const message = `Здравствуйте, ${formData.guestName}!\n\nДобро пожаловать в MORENT 🌴\n\nВаша персональная инструкция по заселению:\n${link}`;
    
    navigator.clipboard.writeText(message);
    toast({
      title: "Сообщение готово!",
      description: "Сообщение с инструкцией скопировано в буфер обмена",
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateAndClearError(field, value);
  };

  const createBooking = async () => {
    if (!formData.apartmentId) {
      toast({ title: "Выберите апартамент", variant: "destructive" });
      return;
    }
    if (!formData.guestName || !formData.checkIn || !formData.checkOut) {
      toast({ title: "Заполните ФИО и даты", variant: "destructive" });
      return;
    }

    try {
      // Try several schema variants for field names
      const checkinIso = formatDateForAPI(formData.checkIn);
      const checkoutIso = formatDateForAPI(formData.checkOut);
      let created: any | null = null;
      const variants: Array<Record<string, any>> = [
        { apartment_id: formData.apartmentId, guest_name: formData.guestName, checkin_date: checkinIso, checkout_date: checkoutIso },
        { apartment: formData.apartmentId, guest_name: formData.guestName, checkin_date: checkinIso, checkout_date: checkoutIso },
        { apartment_id: formData.apartmentId, guest_name: formData.guestName, check_in_date: checkinIso, check_out_date: checkoutIso },
        { apartment: formData.apartmentId, guest_name: formData.guestName, check_in_date: checkinIso, check_out_date: checkoutIso },
      ];

      let lastError: any;
      for (const payload of variants) {
        try {
          // strip undefined/null values to avoid validation issues
          const compact = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== ''));
          created = await directus.request(createItem('bookings', compact));
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!created) throw lastError;

      await loadBookings();
      const link = generateGuestLink();
      await navigator.clipboard.writeText(link);
      toast({ title: "Бронирование создано", description: "Ссылка скопирована в буфер обмена" });
    } catch (e: any) {
      // Try to surface Directus error details for easier debugging
      const details = e?.errors?.[0];
      const message = details?.message || e?.message || 'Не удалось создать бронирование';
      logger.error('Create booking error', e);
      if (e?.response && typeof e.response.json === 'function') {
        try { e.response.json().then((j: any) => logger.error('Directus error body', j)); } catch {}
      }
      toast({ title: "Ошибка", description: message, variant: "destructive" });
    }
  };

  const updateBooking = async () => {
    if (!editingBookingId) return;
    if (!formData.guestName || !formData.checkIn || !formData.checkOut) {
      toast({ title: "Заполните ФИО и даты", variant: "destructive" });
      return;
    }
    try {
      const checkinIso = formatDateForAPI(formData.checkIn);
      const checkoutIso = formatDateForAPI(formData.checkOut);
      const variants: Array<Record<string, any>> = [
        { guest_name: formData.guestName, checkin_date: checkinIso, checkout_date: checkoutIso },
        { guest_name: formData.guestName, check_in_date: checkinIso, check_out_date: checkoutIso },
      ];
      let success = false;
      let lastError: any;
      for (const payload of variants) {
        try {
          const compact = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== ''));
          await directus.request(updateItem('bookings', editingBookingId, compact as any));
          success = true;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!success) throw lastError;

      await loadBookings();
      setEditingBookingId(null);
      toast({ title: 'Бронирование обновлено' });
    } catch (e: any) {
      const details = e?.errors?.[0];
      const message = details?.message || e?.message || 'Не удалось обновить бронирование';
      logger.error('Update booking error', e);
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Удалить бронирование?')) return;
    try {
      await directus.request(deleteItem('bookings', bookingId));
      await loadBookings();
      toast({ title: 'Бронирование удалено' });
    } catch (e) {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  };

  const startEditBooking = (b: { id: string; apartment_id: string; guest_name: string; check_in_date?: string; check_out_date?: string; }) => {
    setEditingBookingId(b.id);
    // set apartment selection to booking's apartment for clarity
    updateFormData('apartmentId', b.apartment_id);
    // fill form fields
    setFormData(prev => ({
      ...prev,
      guestName: b.guest_name || '',
      checkIn: formatDateForDisplay(b.check_in_date),
      checkOut: formatDateForDisplay(b.check_out_date),
    }));
    // update calendar pickers
    const checkInParsed = parseAPIDate(b.check_in_date || '');
    const checkOutParsed = parseAPIDate(b.check_out_date || '');
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
        }));
        toast({ title: 'Апартамент обновлён' });
      } else {
        await directus.request(createItem('apartments', {
          title: apartmentForm.name,
          apartment_number: apartmentForm.number,
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
        }));
        toast({ title: 'Апартамент создан' });
      }
      // reload and reset
      const items = await directus.request(readItems<ApartmentRecord>('apartments', { sort: ['-date_created'] }));
      const mapped = (items || []).map(a => ({
        id: a.id,
        name: a.title || '',
        number: a.apartment_number || '',
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
      setApartmentForm({ name: '', number: '', description: '', address: '', wifi_password: '', entrance_code: '', lock_code: '', manager_name: '', manager_phone: '', manager_email: '', faq_checkin: '', faq_apartment: '', faq_area: '', map_embed_code: '' });
    } catch (e) {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  const editApartment = async (a: { id: string; name: string; number: string; description: string | null; address: string | null; wifi_password: string | null; entrance_code: string | null; lock_code: string | null; }) => {
    try {
      const full = await directus.request(readItem<ApartmentRecord>('apartments', a.id, { fields: ['*'] } as any));
      setSelectedApartment({ id: a.id });
      setApartmentForm({
        name: full.title || '',
        number: full.apartment_number || '',
        description: full.description || '',
        address: full.base_address || '',
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

  return (
    <div className="min-h-screen bg-gradient-wave p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8 shadow-ocean">
          <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold font-playfair text-primary uppercase">Панель менеджера MORENT</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              На главную
            </Button>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
          </div>

          <Tabs defaultValue="guest-data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guest-data" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Данные гостя
              </TabsTrigger>
              <TabsTrigger value="apartments" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Апартаменты
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guest-data" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {checkInDate ? format(checkInDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={(d) => {
                                setCheckInDate(d);
                                if (d) updateFormData('checkIn', format(d, 'dd.MM.yyyy'));
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.checkIn && (
                          <div className="flex items-center gap-1 text-destructive text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.checkIn}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Дата выезда</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              {checkOutDate ? format(checkOutDate, 'dd.MM.yyyy') : 'Выбрать дату'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={(d) => {
                                setCheckOutDate(d);
                                if (d) updateFormData('checkOut', format(d, 'dd.MM.yyyy'));
                              }}
                            />
                          </PopoverContent>
                        </Popover>
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
                <div className="space-y-6">
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
                      Здравствуйте, {formData.guestName || '[Имя гостя]'}!<br/>
                      Добро пожаловать в MORENT 🌴<br/><br/>
                      Ваша персональная инструкция по заселению:<br/>
                      [Ссылка будет вставлена автоматически]
                    </p>
                  </Card>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold font-playfair text-primary border-b border-border pb-2 uppercase">Текущие бронирования</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {bookings.map((b) => (
                        <Card key={b.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="font-medium">{b.guest_name}</div>
                              <div className="text-sm text-muted-foreground">Заезд: {b.check_in_date || '-'} · Выезд: {b.check_out_date || '-'}</div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => startEditBooking(b)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteBooking(b.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {bookings.length === 0 && (
                        <div className="text-sm text-muted-foreground">Нет бронирований{formData.apartmentId ? ' для выбранного апартамента' : ''}.</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </TabsContent>

            

            <TabsContent value="apartments" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold font-playfair text-primary uppercase">Карточки апартаментов</h2>
                <Button
                  onClick={() => {
                    setSelectedApartment(null);
                    setApartmentForm({ name: '', number: '', description: '', address: '', wifi_password: '', entrance_code: '', lock_code: '' });
                    setShowApartmentForm(true);
                  }}
                  className="touch-target"
                  variant="default"
                >
                  <Plus className="w-4 h-4 mr-2" /> Добавить апартамент
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apartments.map((a) => (
                  <Card key={a.id} className="hover-lift">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="inline-block px-2 py-1 rounded-md border-2 border-gold/60 bg-gold/10 text-gold font-bold tracking-wide text-base mb-1">
                            № {a.number}
                          </div>
                          <p className="text-lg font-semibold">{a.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => editApartment(a)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeApartment(a.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/apartment/${a.id}`, '_blank')}
                        >
                          Открыть страницу гостя
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Dialog open={showApartmentForm} onOpenChange={setShowApartmentForm}>
                <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col">
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{selectedApartment?.id ? 'Редактировать апартамент' : 'Новый апартамент'}</DialogTitle>
                    <DialogDescription>Заполните поля карточки апартамента и прикрепите медиа.</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto px-6 pb-2">
                    <Tabs defaultValue="main" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="main">Основное</TabsTrigger>
                        <TabsTrigger value="content">Контент</TabsTrigger>
                        <TabsTrigger value="media">Медиа</TabsTrigger>
                      </TabsList>

                      <TabsContent value="main">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Название</Label>
                            <Input value={apartmentForm.name} onChange={(e) => setApartmentForm({ ...apartmentForm, name: e.target.value })} placeholder="Апартаменты у моря" />
                          </div>
                          <div>
                            <Label>Номер</Label>
                            <Input value={apartmentForm.number} onChange={(e) => setApartmentForm({ ...apartmentForm, number: e.target.value })} placeholder="169" />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Описание</Label>
                            <Textarea value={apartmentForm.description} onChange={(e) => setApartmentForm({ ...apartmentForm, description: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Адрес</Label>
                            <Input value={apartmentForm.address} onChange={(e) => setApartmentForm({ ...apartmentForm, address: e.target.value })} placeholder="Нагорный тупик 13" />
                          </div>
                          <div>
                            <Label>Wi-Fi пароль</Label>
                            <Input value={apartmentForm.wifi_password} onChange={(e) => setApartmentForm({ ...apartmentForm, wifi_password: e.target.value })} placeholder="логин/пароль" />
                          </div>
                          <div>
                            <Label>Код подъезда</Label>
                            <Input value={apartmentForm.entrance_code} onChange={(e) => setApartmentForm({ ...apartmentForm, entrance_code: e.target.value })} placeholder="#2020" />
                          </div>
                          <div>
                            <Label>Код замка</Label>
                            <Input value={apartmentForm.lock_code} onChange={(e) => setApartmentForm({ ...apartmentForm, lock_code: e.target.value })} placeholder="1111" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="content">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Имя менеджера</Label>
                            <Input value={apartmentForm.manager_name} onChange={(e) => setApartmentForm({ ...apartmentForm, manager_name: e.target.value })} />
                          </div>
                          <div>
                            <Label>Телефон</Label>
                            <Input value={apartmentForm.manager_phone} onChange={(e) => setApartmentForm({ ...apartmentForm, manager_phone: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Email</Label>
                            <Input value={apartmentForm.manager_email} onChange={(e) => setApartmentForm({ ...apartmentForm, manager_email: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>FAQ: Заселение</Label>
                            <Textarea rows={3} value={apartmentForm.faq_checkin} onChange={(e) => setApartmentForm({ ...apartmentForm, faq_checkin: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>FAQ: Апартаменты</Label>
                            <Textarea rows={3} value={apartmentForm.faq_apartment} onChange={(e) => setApartmentForm({ ...apartmentForm, faq_apartment: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>FAQ: Территория</Label>
                            <Textarea rows={3} value={apartmentForm.faq_area} onChange={(e) => setApartmentForm({ ...apartmentForm, faq_area: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Код встраивания Яндекс.Карт</Label>
                            <Textarea rows={3} value={apartmentForm.map_embed_code} onChange={(e) => setApartmentForm({ ...apartmentForm, map_embed_code: e.target.value })} />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="media">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MediaUpload
                            apartmentId={selectedApartment?.id!}
                            directusField="photos"
                            title="Фотографии апартамента"
                            onUploadSuccess={() => {}}
                          />
                        <MediaUpload
                            apartmentId={selectedApartment?.id!}
                            directusField="video_entrance"
                            title="Видео подъезда"
                            onUploadSuccess={() => {}}
                          />
                        <MediaUpload
                            apartmentId={selectedApartment?.id!}
                            directusField="video_lock"
                            title="Видео электронного замка"
                            onUploadSuccess={() => {}}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  <div className="flex gap-2 p-6 border-t bg-background">
                    <Button onClick={saveApartment} className="flex-1">{selectedApartment?.id ? 'Обновить' : 'Создать'}</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowApartmentForm(false)}>Отмена</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ManagerPanel;