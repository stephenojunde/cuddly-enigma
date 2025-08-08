import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe string operations to prevent toLowerCase errors
export function safeString(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value)
}

export function safeLowerCase(value: any): string {
  const str = safeString(value)
  return str.toLowerCase()
}

export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined)
  }
  return []
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

export function safeGet<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue
  }
  const value = obj[key]
  return value !== null && value !== undefined ? value : defaultValue
}

// Safe object property access
export function safeAccess<T>(obj: any, path: string[], defaultValue: T): T {
  try {
    let current = obj
    for (const key of path) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue
      }
      current = current[key]
    }
    return current !== null && current !== undefined ? current : defaultValue
  } catch {
    return defaultValue
  }
}

export function safeDate(value: any, fallback: string = ''): string {
  if (!value) return fallback
  
  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return fallback
    }
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } catch {
    return fallback
  }
}
