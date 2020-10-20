export const getStoreCacheData = (key: string) => {
  return localStorage.getItem(key)
}

export const removeCachedData = (key: string) => {
  localStorage.removeItem(key)
}