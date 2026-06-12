import * as React from 'react';
import { Field, FieldLabel } from '@/components/ui/field.tsx';

interface Props {
  label: string;
  comp: React.ReactNode;
}
export default function FieldVisibleInput({ comp, label }: Props) {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="inline-end-input">{label}</FieldLabel>
      {comp}
    </Field>
  );
}
