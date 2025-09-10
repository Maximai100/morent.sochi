import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, Booking, CreateBookingDto, UpdateBookingDto } from '@/services/bookings.service';
import { useToast } from '@/hooks/use-toast';

// Query keys
const BOOKINGS_KEY = (apartmentId?: string) => 
  apartmentId ? ['bookings', apartmentId] : ['bookings'];
const BOOKING_KEY = (id: string) => ['booking', id];

/**
 * Hook to fetch bookings
 */
export const useBookings = (apartmentId?: string) => {
  return useQuery({
    queryKey: BOOKINGS_KEY(apartmentId),
    queryFn: () => bookingService.getAll(apartmentId),
  });
};

/**
 * Hook to fetch single booking
 */
export const useBooking = (id?: string) => {
  return useQuery({
    queryKey: BOOKING_KEY(id!),
    queryFn: () => bookingService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingService.create(data),
    onSuccess: (newBooking) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      // Generate and copy guest link
      const link = bookingService.generateGuestLink(
        newBooking.apartment_id,
        newBooking.guest_name,
        newBooking.checkin_date || undefined,
        newBooking.checkout_date || undefined
      );
      
      navigator.clipboard.writeText(link);

      toast({
        title: 'Бронирование создано',
        description: 'Ссылка скопирована в буфер обмена',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update booking
 */
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingDto }) => 
      bookingService.update(id, data),
    onSuccess: (updatedBooking) => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: BOOKING_KEY(updatedBooking.id) });

      toast({
        title: 'Бронирование обновлено',
        description: 'Изменения успешно сохранены',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete booking
 */
export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => bookingService.delete(id),
    onSuccess: () => {
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });

      toast({
        title: 'Бронирование удалено',
        description: 'Бронирование успешно удалено',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};