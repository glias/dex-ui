export function ellipsisCenter(str: string, takeLength: number, tailLength = takeLength): string {
  if (!str) return str
  if (str.length <= takeLength) return str

  return `${str.substring(0, takeLength)}...${str.substring(str.length - tailLength)}`
}
