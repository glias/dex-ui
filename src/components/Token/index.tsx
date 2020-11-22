import React, { useMemo } from 'react'
import { TOKEN_LOGOS } from 'constants/tokens'
import { SUDT_MAP } from 'constants/sudt'
import { TokenContainer } from './styled'

export interface TokenProps {
  tokenName: string
}

const SHADOW_ASSET_COLOR = '#FCF0E6'
const ETH_COLOR = '#E7EAFE'
const CKB_COLOR = '#D9E8E2'

const Token = ({ tokenName }: TokenProps) => {
  const logo = TOKEN_LOGOS.get(tokenName)
  const color = useMemo(() => {
    switch (tokenName) {
      case 'CKB':
        return CKB_COLOR
      case 'ETH':
        return ETH_COLOR
      default: {
        let hex = CKB_COLOR
        SUDT_MAP.forEach(sudt => {
          if (sudt.info?.symbol === tokenName) {
            hex = CKB_COLOR
          }
        })
        if (tokenName.startsWith('ck')) {
          hex = SHADOW_ASSET_COLOR
        }
        return hex
      }
    }
  }, [tokenName])

  return (
    <TokenContainer color={color}>
      <span className="icon">
        <img alt={tokenName} src={logo} />
      </span>
      <div className="text">{tokenName}</div>
    </TokenContainer>
  )
}

export default Token
