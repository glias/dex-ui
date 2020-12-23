export function asserts(condition: any, msg = 'Assertion failed'): asserts condition {
  if (!condition) throw new Error(msg)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function debounce<T extends (...args: []) => any>(cb: T, delay: number): T {
  let timeout: number

  const enhanced = (...args: []): any => {
    return new Promise(resolve => {
      clearTimeout(timeout)
      setTimeout(() => {
        resolve(cb(...args))
      }, delay)
    })
  }

  return enhanced as T
}
