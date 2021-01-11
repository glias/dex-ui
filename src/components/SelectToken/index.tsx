/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfoCircleFilled, SearchOutlined } from '@ant-design/icons'
import { Divider, Input, Tabs } from 'antd'
import { searchERC20, searchSUDT } from 'APIs'
import BigNumber from 'bignumber.js'
import HeaderWithGoback from 'components/HeaderWithGoback'
import Token from 'components/Token'
import { MetaContainer } from 'pages/Trade/components/TradeOrderConfirm/styled'
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
  clickable,
}: {
  wallet: Wallet
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  clickable: boolean
}) => {
  return (
    <TokenContainer key={wallet.tokenName} onClick={clickable ? onClick : undefined} clickable={clickable}>
      <div className="left">
        <Token tokenName={wallet.tokenName} className="small" />
      </div>
      <div className="right">
        <span>{new BigNumber(wallet.balance.toString()).toFixed(4, 1)}</span>
      </div>
    </TokenContainer>
  )
}

const Meta = ({ info }: { info: React.ReactNode }) => {
  return (
    <MetaContainer>
      <div className="meta">
        <div className="image">
          <InfoCircleFilled translate="info" />
        </div>
        <div>{info}</div>
      </div>
    </MetaContainer>
  )
}

enum SearchStatus {
  None,
  Invalid,
  Unregistered,
}

const SelectToken = ({ filter = Boolean as any, onSelect, currentToken, onBack, groupedByChain }: SelectTokenProps) => {
  const WalletCtx = useContainer(WalletContainer)
  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState<Wallet | undefined>()
  const [searchStatus, setSearchStatus] = useState(SearchStatus.None)
  const [currentTab, setCurrentTab] = useState<'Nervos' | 'Ethereum'>('Nervos')
  const { wallets, erc20Wallets, web3 } = WalletCtx
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

  const handleSearchResult = useCallback(
    async (val: string, tab?: string) => {
      const latestTab = tab ?? currentTab
      if (val === '') {
        return
      }
      if (latestTab === 'Nervos') {
        const [sudt] = (await searchSUDT(val)).data
        if (sudt) {
          const tokenName = sudt.name
          const wallet = wallets.find(w => tokenName.toLowerCase().includes(w.tokenName.toLowerCase()))
          if (wallet) {
            setSearchResult(wallet)
            setSearchStatus(SearchStatus.None)
          } else {
            setSearchResult({
              tokenName: sudt.name,
              balance: new BigNumber(0),
            } as any)
            setSearchStatus(SearchStatus.Unregistered)
          }
        } else {
          setSearchResult(undefined)
          setSearchStatus(SearchStatus.Invalid)
        }
      } else {
        const erc20 = erc20Wallets.find(e => e.address.toLowerCase() === val.toLowerCase())
        if (erc20) {
          setSearchResult(erc20)
          setSearchStatus(SearchStatus.None)
        } else {
          const w = await searchERC20(val, web3!)
          if (w) {
            setSearchResult({
              tokenName: w.tokenName,
              balance: new BigNumber(0),
            } as any)
            setSearchStatus(SearchStatus.Unregistered)
          } else {
            setSearchResult(undefined)
            setSearchStatus(SearchStatus.Invalid)
          }
        }
      }
    },
    [currentTab, erc20Wallets, wallets, web3],
  )

  const searchMeta = useMemo(() => {
    switch (searchStatus) {
      case SearchStatus.None:
        return null
      case SearchStatus.Invalid:
        return <Meta info={<span>Try to use a valid token type hash or token address to find token.</span>} />
      case SearchStatus.Unregistered:
        return (
          <Meta
            // eslint-disable-next-line prettier/prettier
            info={(
              <span>
                Token info is needed before trading this token. Please go to
                <a
                  href="https://github.com/glias/dex-ui/edit/dev/src/constants/sudt.ts"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  &nbsp;Token Registry Center&nbsp;
                </a>
                to submit token info first.
              </span>
              // eslint-disable-next-line prettier/prettier
            )}
          />
        )
      default:
        return null
    }
  }, [searchStatus])

  const tokenListElem = useMemo(() => {
    const filtered = filteredWallets.filter(searchFilter)
    const mapToTokenItem = (wallet: Wallet, clickable: boolean | number = false) => (
      <Item wallet={wallet} onClick={() => onSelect(wallet)} key={wallet.tokenName} clickable={clickable !== false} />
    )

    if (!groupedByChain) return filtered.map(mapToTokenItem)

    return (
      <Tabs
        onChange={e => {
          setCurrentTab(e as 'Nervos' | 'Ethereum')
          handleSearchResult(searchValue, e)
        }}
      >
        <Tabs.TabPane tab="Nervos" key="Nervos">
          {searchResult ? mapToTokenItem(searchResult, false) : filtered.filter(isNervosWallet).map(mapToTokenItem)}
          {searchMeta}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ethereum" key="Ethereum">
          {searchResult ? mapToTokenItem(searchResult, false) : filtered.filter(isEthereumWallet).map(mapToTokenItem)}
          {searchMeta}
        </Tabs.TabPane>
      </Tabs>
    )
  }, [
    groupedByChain,
    filteredWallets,
    searchFilter,
    onSelect,
    searchResult,
    handleSearchResult,
    searchValue,
    searchMeta,
  ])

  const searchOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearchValue(val)
      if (val.startsWith('0x')) {
        handleSearchResult(val)
      } else {
        setSearchResult(undefined)
        setSearchStatus(SearchStatus.None)
      }
    },
    [handleSearchResult],
  )

  return (
    <Container>
      {onBack && <HeaderWithGoback title={i18n.t('trade.selectToken')} onClick={onBack} />}
      <div className="current">
        <div className="label">{i18n.t('trade.current')}</div>
        <Item onClick={onBack} wallet={current} clickable />
      </div>
      <Divider style={{ margin: '14px 0' }} />
      <Input
        prefix={<SearchOutlined translate="search" />}
        placeholder={i18n.t('trade.searchToken')}
        onChange={searchOnChange}
        value={searchValue}
      />
      <Main>{tokenListElem}</Main>
    </Container>
  )
}

export default SelectToken
