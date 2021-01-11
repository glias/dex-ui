import { QuestionCircleOutlined } from '@ant-design/icons'
import { TOKEN_LOGOS } from 'constants/tokens'
import React, { useMemo } from 'react'
import { TokenContainer } from './styled'

export interface TokenProps {
  tokenName: string
  className?: string
}

const CrossChainTokenColor: Record<string, string> = {
  ETH: '#C1C8E2',
  USDT: '#B0E3D4',
  USDC: '#B3D0F0',
  DAI: '#EFDDBF',
}

const WHITE_LIST_TOKEN = new Set(['CKB', 'ckETH', 'ckUSDT', 'ckUSDC', 'ckDAI', 'CoffeeCoin', 'LoveLina'])

const Token = ({ tokenName, className }: TokenProps) => {
  const logo = TOKEN_LOGOS.get(tokenName)
  const color = useMemo(() => {
    if (tokenName in CrossChainTokenColor) return CrossChainTokenColor[tokenName]
    if (WHITE_LIST_TOKEN.has(tokenName)) return '#D9E8E2'
    return '#EEEEEE'
  }, [tokenName])

  return (
    <TokenContainer color={color} className={className ?? ''}>
      <span className="icon">
        {logo ? <img alt={tokenName} src={logo} /> : <QuestionCircleOutlined translate="unknown" />}
      </span>
      <div className="text">{tokenName}</div>
    </TokenContainer>
  )
}

export default Token
