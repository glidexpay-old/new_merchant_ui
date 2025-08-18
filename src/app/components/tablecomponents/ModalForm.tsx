import React, { useState, FormEvent, useRef, useEffect } from 'react';

export interface ModalFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  options?: { label: string; value: string | number }[]; // for select
  required?: boolean;
  placeholder?: string;
}

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string | number | boolean>) => Promise<void>;
  initialValues?: Record<string, unknown>;
  fields: ModalFormField[];
  title?: string;
  submitLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalForm: React.FC<ModalFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  fields,
  title = 'Form',
  submitLabel = 'Submit',
  size = 'md',
}) => {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      setFormValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getFieldValue = (name: string): string | number | readonly string[] | undefined => {
    const value = formValues[name];
    if (typeof value === 'string' || typeof value === 'number' || Array.isArray(value)) {
      return value;
    }
    return '';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formValues[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues as Record<string, string | number | boolean>);
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
      // Handle API validation errors if needed
      if (error instanceof Error) {
        setErrors({ form: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // Ref for modal content
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on click outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 transition-opacity" style={{ background: 'transparent', opacity: 0.9 }} />
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} mx-auto bg-white rounded-lg shadow-xl overflow-hidden z-10`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>

        {/* Form Error */}
        {errors.form && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm" role="alert">
            {errors.form}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor={field.name}
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={getFieldValue(field.name) as string}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={getFieldValue(field.name) as string}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                  >
                    <option value="" disabled>
                      {field.placeholder || 'Select an option'}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={getFieldValue(field.name) as string | number | readonly string[] | undefined}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={`w-full px-3 py-2 border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                  />
                )}

                {errors[field.name] && (
                  <p id={`${field.name}-error`} className="mt-1 text-sm text-red-600">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;