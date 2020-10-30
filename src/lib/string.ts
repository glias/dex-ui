export const truncateStr = (str: string): string => {
  return str.length > 10 ? `${str.slice(0, 10)}...${str.slice(-10)}` : str
}

export const titleCase = (str: string): string => {
  const isStr = Object.prototype.toString.call(str) === '[object String]'

  if (isStr && str.length) {
    return str[0].toLocaleUpperCase() + str.slice(1)
  }

  return str
}
