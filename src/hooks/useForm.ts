import { 
  useForm as useReactHookForm, 
  UseFormReturn, 
  FieldValues, 
  SubmitHandler, 
  UseFormProps, 
  FieldError, 
  Control,
  Resolver,
  FieldErrorsImpl,
  Merge,
  DeepRequired
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Define the type for form errors
type FormErrors<T extends FieldValues> = {
  [K in keyof T]?: FieldError | Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[K]>>;
};

// Define the type for the useForm hook return value
export type UseFormReturnType<T extends FieldValues> = Omit<UseFormReturn<T>, 'handleSubmit' | 'formState' | 'control'> & {
  errors: FormErrors<T>;
  handleSubmit: (onValid: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  resetForm: () => void;
  control: Control<T>;
};

// Define the options for the useForm hook
type UseFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
  schema?: z.ZodType<any>;
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
  const formProps: UseFormProps<T> = {
    defaultValues: defaultValues as any,
    ...formOptions,
  };

  if (schema) {
    formProps.resolver = zodResolver(schema as any) as Resolver<T>;
  }

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, isSubmitting },
    reset,
    ...formMethods
  } = useReactHookForm<T>(formProps);

  // Format errors to match our FormErrors type
  const formattedErrors = Object.entries(errors).reduce<FormErrors<T>>((acc, [key, value]) => {
    if (value) {
      acc[key as keyof T] = value as any;
    }
    return acc;
  }, {} as FormErrors<T>);

  // Handle form submission with error handling and success/error toasts
  const handleSubmit = (onValid: SubmitHandler<T>) => {
    return rhfHandleSubmit(async (data, event) => {
      try {
        await onValid(data as T, event);
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          await onSuccess(data as T);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message from the error object if available
        const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
        toast.error(errorMessage);
        
        if (onError) {
          const fieldErrors = Object.entries(errors).reduce((acc, [key, value]) => {
            if (value) {
              acc[key as keyof T] = value as FieldError;
            }
            return acc;
          }, {} as FormErrors<T>);
          await onError(fieldErrors);
        }
      }
    });
  };

  // Reset form to default values
  const resetForm = () => {
    reset(defaultValues as any);
  };

  return {
    ...formMethods,
    control: control as Control<T>,
    handleSubmit,
    errors: formattedErrors,
    isSubmitting,
    reset: resetForm,
    resetForm,
  } as UseFormReturnType<T>;
};

// Re-export useful types and utilities from react-hook-form
export { Controller } from 'react-hook-form';
export type { FieldError, Control, FieldValues } from 'react-hook-form';

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
  fieldName: keyof T
): string | undefined => {
  const error = errors[fieldName];
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error.message) return String(error.message);
  return undefined;
};

// Helper function to check if a field has an error
export const hasError = <T extends FieldValues>(
  errors: FormErrors<T>,
  fieldName: keyof T
): boolean => {
  return !!errors[fieldName];
};

export default useForm;
