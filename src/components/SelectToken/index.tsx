/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchOutlined } from '@ant-design/icons'
import { Divider, Input, Tabs } from 'antd'
import BigNumber from 'bignumber.js'
import HeaderWithGoback from 'components/HeaderWithGoback'
import Token from 'components/Token'
import React, { useCallback, useMemo, useState } from 'react'
import { useContainer } from 'unstated-next'
import i18n from 'utils/i18n'
import { isEthereumWallet, isNervosWallet, Wallet, WalletContainer } from '../../containers/wallet'
import { Container, Main, TokenContainer } from './styled'

export interface SelectTokenProps {
  filter?: (value: Wallet, index: number, array: Wallet[]) => boolean
  onSelect: (wallet: Wallet) => void
  onBack?: () => void
  currentToken: string
  groupedByChain?: boolean
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

const SelectToken = ({ filter = Boolean as any, onSelect, currentToken, onBack, groupedByChain }: SelectTokenProps) => {
  const WalletCtx = useContainer(WalletContainer)
  const [searchValue, setSearchValue] = useState('')
  const { wallets } = WalletCtx
  const filteredWallets = useMemo(() => {
    return wallets
      .filter(w => w.tokenName !== currentToken)
      .filter(filter)
      .sort((w1, w2) => {
        // 1. CKB
        // 2. ETH
        // 3. compare balance
        // 4. compare token name

        if (w1.tokenName === 'CKB' || w2.tokenName === 'CKB') return 1
        if (w1.tokenName === 'ETH' || w2.tokenName === 'ETH') return 1

        const diff = w2.balance.minus(w1.balance)
        if (diff.eq(0)) return w1.tokenName.localeCompare(w2.tokenName)

        return diff.toNumber()
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

  const tokenListElem = useMemo(() => {
    const filtered = filteredWallets.filter(searchFilter)
    const mapToTokenItem = (wallet: Wallet) => (
      <Item wallet={wallet} onClick={() => onSelect(wallet)} key={wallet.tokenName} />
    )

    if (!groupedByChain) return filtered.map(mapToTokenItem)

    return (
      <Tabs>
        <Tabs.TabPane tab="Nervos" key="Nervos">
          {filtered.filter(isNervosWallet).map(mapToTokenItem)}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ethereum" key="Ethereum">
          {filtered.filter(isEthereumWallet).map(mapToTokenItem)}
        </Tabs.TabPane>
      </Tabs>
    )
  }, [groupedByChain, filteredWallets, searchFilter, onSelect])

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
      <Main>{tokenListElem}</Main>
    </Container>
  )
}

export default SelectToken
