import Token from 'components/Token'
import WalletContainer, { isCkbWallet } from 'containers/wallet'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Balance } from '../Balance'
import { Description } from './Description'

const BalanceStatusWrapper = styled.div`
  padding: 0 24px;
  text-align: center;

  .space-bottom {
    margin-bottom: 16px;
    &-large {
      margin-bottom: 32px;
    }
  }

  .balance-desc {
    display: flex;

    &-item {
      border-right: 4px solid #e1e1e1;
      flex: 1;
      :last-child {
        border-right: none;
        padding: 0 4px;
      }
    }
  }
`

export const BalanceStatus = () => {
  const { t } = useTranslation()
  const { tokenName } = useParams<{ tokenName: string }>()
  const { wallets } = WalletContainer.useContainer()

  const wallet = useMemo(() => wallets.find(wallet => wallet.tokenName === tokenName), [tokenName, wallets])

  if (!wallet) return null

  const { total, free, inUse, locked } = {
    total: wallet.balance,
    free: wallet.balance.sub(wallet.lockedOrder),
    inUse: isCkbWallet(wallet) ? wallet.inuse : 0,
    locked: wallet.lockedOrder,
  }
  return (
    <BalanceStatusWrapper>
      <div className="space-bottom">
        <Token tokenName={tokenName} className="small" />
      </div>
      <div className="space-bottom">
        <Balance value={total} type={tokenName} size={24} unitSize={20} />
      </div>
      <div className="balance-desc space-bottom">
        <div className="balance-desc-item">
          <Description label={t('Free')}>
            <Balance value={free} />
          </Description>
        </div>
        {isCkbWallet(wallet) && (
          <div className="balance-desc-item">
            <Description label={t('In Use')}>
              <Balance value={inUse} />
            </Description>
          </div>
        )}
        <div className="balance-desc-item">
          <Description label={t('Locked in Gliaswap')}>
            <Balance value={locked} />
          </Description>
        </div>
      </div>
    </BalanceStatusWrapper>
  )
}
