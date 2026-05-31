import React from 'react';

export interface Column {
  key: string;
  label: string;
  render?: (val: any, row: any) => React.ReactNode;
}

export interface FormField {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}
