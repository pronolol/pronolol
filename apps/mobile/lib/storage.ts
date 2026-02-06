// Web fallback using localStorage
export function getItem(key: string): string | null | Promise<string | null> {
  return localStorage.getItem(key)
}

export function setItem(key: string, value: string): void {
  localStorage.setItem(key, value)
}

export function deleteItem(key: string): Promise<void> {
  localStorage.removeItem(key)
  return Promise.resolve()
}
