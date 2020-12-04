import { notification } from 'antd'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ellipsisCenter } from 'utils/common'
import { EXPLORER_URL } from '../constants'
import { TransactionListenerContainer } from '../containers/listener'

interface SuccessTransactionNotificationProps {
  txHash: string
}

const SuccessTransactionNotification: React.FC<SuccessTransactionNotificationProps> = (
  props: SuccessTransactionNotificationProps,
) => {
  const { t } = useTranslation()
  const { txHash } = props
  return (
    <a target="_blank" rel="noopener noreferrer" href={`${EXPLORER_URL}transaction/${txHash}`}>
      {t('Transaction has been committed')}
      &nbsp;
      <small>{ellipsisCenter(txHash, 8)}</small>
    </a>
  )
}

export const useNotifyTransaction = () => {
  const { listener } = TransactionListenerContainer.useContainer()

  useEffect(() => {
    if (!listener) return undefined

    const notify = (txs: CKBComponents.Transaction[]): void => {
      txs.forEach(tx => notification.success({ message: <SuccessTransactionNotification txHash={tx.hash} /> }))
    }

    listener.on('committed', notify)
    listener.start()

    return () => {
      listener.stop()
    }
  }, [listener])
}
