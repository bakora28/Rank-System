import { Check } from 'lucide-react';
import { isValidEgyptianPhone } from '@/lib/phone';
import { Input } from './Input';

export function PhoneField({
  value,
  onChange,
  label = 'Phone number',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const touched = value.length > 0;
  const valid = !touched || isValidEgyptianPhone(value);

  return (
    <div>
      <Input
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="01XXXXXXXXX"
        inputMode="numeric"
        error={touched && !valid ? 'Must be 11 digits starting with 010, 011, 012, or 015.' : undefined}
      />
      {touched && valid && (
        <span className="mt-1.5 flex items-center gap-1 text-xs text-success">
          <Check className="size-3.5" /> Valid Egyptian mobile number
        </span>
      )}
    </div>
  );
}

export function isPhoneFieldValid(value: string): boolean {
  return value.length === 0 || isValidEgyptianPhone(value);
}
