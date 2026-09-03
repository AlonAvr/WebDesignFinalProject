import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges Tailwind class names safely, resolving conflicting utility classes.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
