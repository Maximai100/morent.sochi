import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Hook for creating stable callbacks
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps) as T;
};

/**
 * Hook for debouncing values
 */
export const useDebouncedValue = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling callbacks
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      const now = Date.now();
      
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook for tracking previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Hook for checking if component is mounted
 */
export const useIsMounted = (): (() => boolean) => {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};

/**
 * Hook for lazy initialization
 */
export const useLazyInit = <T>(factory: () => T): T => {
  const [value] = React.useState(factory);
  return value;
};

/**
 * Hook for memoizing objects based on their properties
 */
export const useMemoizedObject = <T extends Record<string, any>>(obj: T): T => {
  const stringified = JSON.stringify(obj);
  
  return useMemo(() => obj, [stringified]);
};

/**
 * Hook for memoizing arrays
 */
export const useMemoizedArray = <T>(array: T[]): T[] => {
  const stringified = JSON.stringify(array);
  
  return useMemo(() => array, [stringified]);
};

/**
 * Hook for optimized sorting
 */
export const useSortedArray = <T>(
  array: T[],
  compareFn?: (a: T, b: T) => number
): T[] => {
  return useMemo(() => {
    const sorted = [...array];
    sorted.sort(compareFn);
    return sorted;
  }, [array, compareFn]);
};

/**
 * Hook for optimized filtering
 */
export const useFilteredArray = <T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] => {
  return useMemo(() => {
    return array.filter(predicate);
  }, [array, predicate]);
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitor = (label: string) => {
  const startTime = useRef<number>();
  
  const start = useCallback(() => {
    startTime.current = performance.now();
  }, []);
  
  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      if (import.meta.env.DEV) {
        console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
      }
    }
  }, [label]);
  
  return { start, end };
};