import { List } from 'antd'
import Token from 'components/Token'
import WalletContainer from 'containers/wallet'
import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { Balance } from '../Balance'
import { AssetManagerContainer } from '../hooks'
// import { Asset } from '../components/Asset'

const AssetListWrapper = styled.div`
  padding: 0 16px;

  .ant-list-split .ant-list-item {
    border-bottom: 0;
    cursor: pointer;
    font-weight: bold;
    padding: 16px;
  }

  .arrow-icon {
    margin-left: 8px;
  }
`

export const AssetList: React.FC = () => {
  const { push } = useHistory()
  const { ckbWallet, sudtWallets } = WalletContainer.useContainer()
  const { setTokenName } = AssetManagerContainer.useContainer()

  const wallets = [ckbWallet, ...sudtWallets]
  const tokenList = wallets.map(wallet => ({
    tokenName: wallet.tokenName,
    balance: wallet.balance,
  }))

  function onTokenClicked(tokenName: string) {
    setTokenName(tokenName)
    push(`/assets/${tokenName}`)
  }

  return (
    <AssetListWrapper>
      <List>
        {tokenList.map(({ tokenName, balance }) => (
          <List.Item key={tokenName} onClick={() => onTokenClicked(tokenName)}>
            <Token tokenName={tokenName} className="small" />
            <span>
              <Balance value={balance} />
              <span className="arrow-icon">&gt;</span>
            </span>
          </List.Item>
        ))}
      </List>
    </AssetListWrapper>
  )
}
