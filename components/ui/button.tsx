import * as React from 'react';
const cx = (...a: (string|false|undefined)[]) => a.filter(Boolean).join(' ');

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'outline'|'secondary'|'destructive' };

export const Button: React.FC<ButtonProps> = ({ className, variant='default', ...props }) => {
  const base = 'px-3 py-2 rounded-2xl text-sm shadow-sm transition';
  const variants: Record<string,string> = {
    default:'bg-black text-white hover:opacity-90',
    outline:'border border-gray-300 hover:bg-gray-50',
    secondary:'bg-gray-100 hover:bg-gray-200',
    destructive:'bg-red-600 text-white hover:bg-red-700'
  };
  return <button className={cx(base, variants[variant], className)} {...props} />;
};
