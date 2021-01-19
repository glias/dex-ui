import React, { useMemo } from 'react'
import { README_URL } from 'constants/url'
import { useContainer } from 'unstated-next'
import OrderContainer, { OrderType } from 'containers/order'
import WalletContainer from 'containers/wallet'

import { ORDER_CELL_CAPACITY, MIN_SUDT_CAPACITY, MAX_TRANSACTION_FEE } from 'constants/number'
import BigNumber from 'bignumber.js'

import i18n from '../../../../utils/i18n'
import { MetaContainer } from './styled'

export const Meta = ({ lockedCkbAmount, transactionFee }: { lockedCkbAmount: string; transactionFee: string }) => {
  const { pair, orderType, pay } = useContainer(OrderContainer)
  const { sudtWallets, ckbWallet } = useContainer(WalletContainer)
  const message = useMemo(() => {
    if (orderType === OrderType.Ask) {
      const [tokenName] = pair
      const sudtWallet = sudtWallets.find(s => s.tokenName === tokenName)!
      if (
        ckbWallet.balance.isLessThan(
          new BigNumber(ORDER_CELL_CAPACITY).plus(MIN_SUDT_CAPACITY).plus(61).plus(MAX_TRANSACTION_FEE),
        )
      ) {
        return `Your ${ckbWallet.balance.minus(transactionFee)} CKB and ${sudtWallet.balance
          .minus(pay)
          .toString()} ${tokenName} will be temporarily locked and will be automatically unlocked once trading successfully.`
      }
      return `Your ${ORDER_CELL_CAPACITY} CKB will be temporarily locked and will be automatically unlocked once trading successfully.`
    }

    if (ckbWallet.balance.isGreaterThan(ORDER_CELL_CAPACITY + 61 + MAX_TRANSACTION_FEE)) {
      return `Your ${ORDER_CELL_CAPACITY} CKB will be temporarily locked and will be automatically unlocked once trading successfully.`
    }

    return `Your ${new BigNumber(lockedCkbAmount)
      .minus(pay)
      .toString()} CKB will be temporarily locked and will be automatically unlocked once trading successfully.`
  }, [pair, orderType, sudtWallets, ckbWallet.balance, pay, lockedCkbAmount, transactionFee])
  return (
    <MetaContainer>
      <span>
        {message}
        &nbsp;
        <a href={`${README_URL}#are-there-any-fees-to-make-a-trade`} target="_blank" rel="noreferrer noopener">
          {i18n.t('trade.result.learnWhy')}
        </a>
      </span>
    </MetaContainer>
  )
}
