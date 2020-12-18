/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useContainer } from 'unstated-next'
import { Divider, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import i18n from 'utils/i18n'
import HeaderWithGoback from 'components/HeaderWithGoback'
import Token from 'components/Token'
import { Container, TokenContainer, Main } from './styled'
import { Wallet, WalletContainer } from '../../containers/wallet'

export interface SelectTokenProps {
  filter?: (value: Wallet, index: number, array: Wallet[]) => boolean
  onSelect: (wallet: Wallet) => void
  onBack?: () => void
  currentToken: string
}

const Item = ({
  wallet,
  onClick,
}: {
  wallet: Wallet
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
  return (
    <TokenContainer key={wallet.tokenName} onClick={onClick}>
      <div className="left">
        <Token tokenName={wallet.tokenName} className="small" />
      </div>
      <div className="right">
        <span>{new BigNumber(wallet.balance.toString()).toFixed(4, 1)}</span>
      </div>
    </TokenContainer>
  )
}

const SelectToken = ({ filter = Boolean as any, onSelect, currentToken, onBack }: SelectTokenProps) => {
  const WalletCtx = useContainer(WalletContainer)
  const [searchValue, setSearchValue] = useState('')
  const { wallets } = WalletCtx
  const filteredWallets = useMemo(() => {
    return wallets
      .filter(w => w.tokenName !== currentToken)
      .filter(filter)
      .sort((w1, w2) => {
        if (w1.tokenName === 'CKB' || w2.tokenName === 'CKB') {
          return 1
        }
        return parseFloat(w2.balance.minus(w1.balance).toString())
      })
  }, [wallets, filter, currentToken])

  const searchFilter = useCallback(
    (wallet: Wallet) => {
      if (searchValue) {
        return wallet.tokenName.toLowerCase().includes(searchValue.toLowerCase())
      }
      return Boolean
    },
    [searchValue],
  )

  const current = useMemo(() => {
    return wallets.find(w => w.tokenName === currentToken)!
  }, [currentToken, wallets])

  return (
    <Container>
      {onBack && <HeaderWithGoback title={i18n.t('trade.selectToken')} onClick={onBack} />}
      <div className="current">
        <div className="label">{i18n.t('trade.current')}</div>
        <Item onClick={onBack} wallet={current} />
      </div>
      <Divider style={{ margin: '14px 0' }} />
      <Input
        prefix={<SearchOutlined translate="search" />}
        placeholder={i18n.t('trade.searchToken')}
        onChange={e => setSearchValue(e.target.value)}
        value={searchValue}
      />
      <Main>
        {filteredWallets.filter(searchFilter).map(wallet => {
          return <Item wallet={wallet} onClick={() => onSelect(wallet)} key={wallet.tokenName} />
        })}
      </Main>
    </Container>
  )
}

export default SelectToken
