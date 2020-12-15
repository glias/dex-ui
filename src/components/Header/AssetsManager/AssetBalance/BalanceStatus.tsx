import BigNumber from 'bignumber.js'
import Token from 'components/Token'
import { isCkbWallet } from 'containers/wallet'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { Balance } from '../Balance'
import { AssetManagerContainer } from '../hooks'
import { Description } from './Description'

const BalanceStatusWrapper = styled.div`
  padding: 24px 24px 0;
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
  const { wallet, tokenName } = AssetManagerContainer.useContainer()
  const { tokenName: paramTokenName } = useParams<{ tokenName: string }>()
  const { url } = useRouteMatch()

  if (!wallet) return null

  const { free, inUse, locked } = {
    free: isCkbWallet(wallet) ? wallet.free : wallet.balance.minus(wallet.lockedOrder),
    inUse: isCkbWallet(wallet) ? wallet.inuse : 0,
    locked: wallet.lockedOrder,
  }

  // only show suffix when /assets
  const suffix = url === '/assets' ? 'CKB' : undefined

  const total = new BigNumber(free).plus(inUse).plus(locked)
  return (
    <BalanceStatusWrapper>
      {paramTokenName && (
        <div className="space-bottom">
          <Token tokenName={tokenName} className="small" />
        </div>
      )}
      <div className="space-bottom">
        <Balance value={total} suffix={suffix} size={24} unitSize={20} />
      </div>
      <div className="balance-desc space-bottom">
        <div className="balance-desc-item">
          <Description label={t('Available')}>
            <Balance value={free} />
          </Description>
        </div>
        {isCkbWallet(wallet) && (
          <div className="balance-desc-item">
            <Description label={t('Occupied')}>
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
