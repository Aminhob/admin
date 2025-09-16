import { useForm as useReactHookForm, UseFormReturn, FieldValues, SubmitHandler, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';
import { toast } from 'react-hot-toast';

// Define the type for form errors
type FormErrors<T extends FieldValues> = {
  [K in keyof T]?: {
    message?: string;
  };
};

// Define the type for the useForm hook return value
export type UseFormReturnType<T extends FieldValues> = UseFormReturn<T> & {
  errors: FormErrors<T>;
  handleSubmit: (onValid: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  resetForm: () => void;
};

// Define the options for the useForm hook
type UseFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
  schema?: ZodType<T>;
  defaultValues?: Partial<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (errors: FormErrors<T>) => void | Promise<void>;
  successMessage?: string;
};

/**
 * A custom hook that extends react-hook-form with additional functionality
 * like form validation with Zod, error handling, and success/error toasts.
 */
export const useForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSuccess,
  onError,
  successMessage,
  ...formOptions
}: UseFormOptions<T> = {}): UseFormReturnType<T> => {
  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    reset,
    ...formMethods
  } = useReactHookForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues as any,
    ...formOptions,
  });

  // Format errors to match the FormErrors type
  const formattedErrors = Object.keys(errors).reduce<FormErrors<T>>((acc, key) => {
    const error = errors[key];
    if (error) {
      acc[key as keyof T] = {
        message: error.message as string,
      };
    }
    return acc;
  }, {});

  // Handle form submission with error handling and success/error toasts
  const handleSubmit = (onValid: SubmitHandler<T>) => {
    return rhfHandleSubmit(async (data, event) => {
      try {
        await onValid(data, event);
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          await onSuccess(data);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message from the error object if available
        const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
        toast.error(errorMessage);
        
        if (onError) {
          await onError(formattedErrors);
        }
      }
    });
  };

  // Reset form to default values
  const resetForm = () => {
    reset(defaultValues as any);
  };

  return {
    control,
    handleSubmit,
    errors: formattedErrors,
    isSubmitting,
    reset: resetForm,
    resetForm,
    ...formMethods,
  };
};

// Re-export useful types and utilities from react-hook-form
export { Controller } from 'react-hook-form';
export type { FieldError, Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';

// Helper function to create form schemas with Zod
export const createFormSchema = <T extends z.ZodRawShape>(schema: T) => {
  return z.object(schema);
};

// Common validation schemas
export const validationSchemas = {
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  requiredString: (fieldName: string) => z.string().min(1, `${fieldName} is required`),
  optionalString: () => z.string().optional(),
  url: z.string().url('Please enter a valid URL'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  number: (min?: number, max?: number) => {
    let schema = z.number();
    if (min !== undefined) {
      schema = schema.min(min, `Must be at least ${min}`);
    }
    if (max !== undefined) {
      schema = schema.max(max, `Must be at most ${max}`);
    }
    return schema;
  },
  date: z.string().or(z.date()),
  array: <T extends z.ZodTypeAny>(schema: T, min = 1) =>
    z.array(schema).min(min, `At least ${min} item${min === 1 ? '' : 's'} is required`),
};

// Helper function to get error message for a field
export const getErrorMessage = <T extends FieldValues>(
  errors: FormErrors<T>,
  fieldName: keyof T,
): string | undefined => {
  return errors[fieldName]?.message;
};

// Helper function to check if a field has an error
export const hasError = <T extends FieldValues>(
  errors: FormErrors<T>,
  fieldName: keyof T,
): boolean => {
  return !!errors[fieldName];
};

export default useForm;
