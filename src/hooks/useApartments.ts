import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentService, Apartment, CreateApartmentDto, UpdateApartmentDto } from '@/services/apartments.service';
import { useToast } from '@/hooks/use-toast';

// Query keys
const APARTMENTS_KEY = ['apartments'];
const APARTMENT_KEY = (id: string) => ['apartment', id];

/**
 * Hook to fetch all apartments
 */
export const useApartments = () => {
  return useQuery({
    queryKey: APARTMENTS_KEY,
    queryFn: () => apartmentService.getAll(),
  });
};

/**
 * Hook to fetch single apartment
 */
export const useApartment = (id?: string) => {
  return useQuery({
    queryKey: APARTMENT_KEY(id!),
    queryFn: () => apartmentService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create apartment
 */
export const useCreateApartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateApartmentDto) => apartmentService.create(data),
    onSuccess: (newApartment) => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: APARTMENTS_KEY });
      
      // Optionally add the new apartment to cache immediately
      queryClient.setQueryData<Apartment[]>(APARTMENTS_KEY, (old) => {
        if (!old) return [newApartment];
        return [...old, newApartment];
      });

      toast({
        title: 'Апартамент создан',
        description: `Апартамент №${newApartment.apartment_number} успешно создан`,
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
 * Hook to update apartment
 */
export const useUpdateApartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApartmentDto }) => 
      apartmentService.update(id, data),
    onSuccess: (updatedApartment) => {
      // Invalidate both list and single apartment queries
      queryClient.invalidateQueries({ queryKey: APARTMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: APARTMENT_KEY(updatedApartment.id) });
      
      // Update cache immediately
      queryClient.setQueryData<Apartment[]>(APARTMENTS_KEY, (old) => {
        if (!old) return [updatedApartment];
        return old.map(apt => apt.id === updatedApartment.id ? updatedApartment : apt);
      });

      toast({
        title: 'Апартамент обновлен',
        description: `Апартамент №${updatedApartment.apartment_number} успешно обновлен`,
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
 * Hook to delete apartment
 */
export const useDeleteApartment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => apartmentService.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate apartments list
      queryClient.invalidateQueries({ queryKey: APARTMENTS_KEY });
      
      // Remove from cache immediately
      queryClient.setQueryData<Apartment[]>(APARTMENTS_KEY, (old) => {
        if (!old) return [];
        return old.filter(apt => apt.id !== deletedId);
      });

      toast({
        title: 'Апартамент удален',
        description: 'Апартамент успешно удален',
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