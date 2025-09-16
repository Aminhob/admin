import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle localStorage with type safety and SSR support
 * @param key - The key to use for localStorage
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns [storedValue, setValue] - The stored value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      // Get from local storage by key
      const storageKey = `telegram_admin_${key}`;
      const item = window.localStorage.getItem(storageKey);
      
      // Parse stored json or if none, return initialValue
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          const storageKey = `telegram_admin_${key}`;
          window.localStorage.setItem(storageKey, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const storageKey = `telegram_admin_${key}`;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook to get a value from localStorage
 * @param key - The key to get from localStorage
 * @param initialValue - The initial value to return if the key doesn't exist
 * @returns The stored value or initialValue
 */
export function useLocalStorageValue<T>(key: string, initialValue: T): T {
  const [value] = useLocalStorage(key, initialValue);
  return value;
}

/**
 * Hook to set a value in localStorage
 * @param key - The key to set in localStorage
 * @returns A function to set the value
 */
export function useSetLocalStorage<T>(key: string): (value: T | ((val: T) => T)) => void {
  const [, setValue] = useLocalStorage(key, null as unknown as T);
  return setValue;
}

/**
 * Hook to remove a value from localStorage
 * @param key - The key to remove from localStorage
 * @returns A function to remove the value
 */
export function useRemoveLocalStorage(key: string): () => void {
  return useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const storageKey = `telegram_admin_${key}`;
        window.localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);
}

/**
 * Hook to clear all items from localStorage (with optional prefix)
 * @param prefix - Optional prefix to only clear items with this prefix
 * @returns A function to clear localStorage
 */
export function useClearLocalStorage(prefix: string = ''): () => void {
  return useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const fullPrefix = `telegram_admin_${prefix}`;
        
        if (prefix) {
          // Only remove items with the specified prefix
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith(fullPrefix)) {
              window.localStorage.removeItem(key);
            }
          });
        } else {
          // Clear everything with the telegram_admin_ prefix
          const prefixToRemove = 'telegram_admin_';
          Object.keys(window.localStorage).forEach(key => {
            if (key.startsWith(prefixToRemove)) {
              window.localStorage.removeItem(key);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [prefix]);
}
