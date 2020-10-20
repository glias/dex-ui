
export const truncatureStr = (
	str: string, 
	reservedLen: number,
	direction: 'left' | 'right' | 'center' = 'right',
	directionlen?: {
		left?: number,
		right?: number
	},
	ellipsis?: string
	): string => {
		let len = 0
		let directionleftlen = 0
		let directionrightlen = 0

		const Ellipsis = ellipsis || '...'

		if (directionlen && directionlen.right) {
			len = directionlen.left || 0 + directionlen.right || 0
		}

		if (reservedLen <= 0 ||  len > reservedLen || str.length >= reservedLen) {
			// return origin str while args is error 
			return str
		}
		
		// if directionleftlen and directionrightlen add up less than reservedLen 
		// and used by default directionleftlen
		switch (direction) {
			case "left":
				return Ellipsis + str.slice(str.length - reservedLen)
			case 'right':
				return str.slice(str.length - reservedLen) + Ellipsis
			case 'center':
				return str.slice(0, directionleftlen) + Ellipsis + 
					directionrightlen ? str.slice(-directionrightlen) : ''
		}
		return ''
}