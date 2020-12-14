import { QuestionCircleFilled } from '@ant-design/icons'
import PWCore from '@lay2/pw-core'
import { Divider, Result, Spin } from 'antd'
import { getCkbTransactionDetail, getSudtTransactionDetail, TransactionDetailModel } from 'APIs'
import Token from 'components/Token'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { EXPLORER_URL } from '../../../../constants'
import { TransactionDirection, TransactionStatus } from '../api'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Balance } from '../Balance'
import { TransactionStatusIcon } from '../components/TransactionStatus'
import { asserts } from '../helper'
import { AssetManagerContainer } from '../hooks'

const TransactionDetailWrapper = styled.div`
  padding: 16px;

  .ant-result {
    padding: 8px;
  }

  table {
    width: 100%;
  }

  td,
  th {
    padding: 4px;
  }

  th {
    color: #666666;
    white-space: nowrap;

    width: 100px;
  }

  td {
    word-break: break-all;
  }

  .ant-divider {
    margin-top: 0;
  }

  a {
    text-decoration: underline;
  }
`

interface ResultMainProps {
  status: TransactionStatus
  direction: TransactionDirection
}

const UnknownResultMain: React.FC = () => {
  const { t } = useTranslation()
  const unknown = t('Unknown')
  return <Result icon={<QuestionCircleFilled translate={unknown} />} title={unknown} />
}

const ResultMain: React.FC<ResultMainProps> = (props: ResultMainProps) => {
  const { status, direction } = props
  const { t } = useTranslation()

  let displayStatus = ''
  if (status === TransactionStatus.Committed) {
    if (direction === TransactionDirection.In) displayStatus = t('Received')
    if (direction === TransactionDirection.Out) displayStatus = t('Sent')
  } else {
    if (direction === TransactionDirection.In) displayStatus = t('Receiving')
    if (direction === TransactionDirection.Out) displayStatus = t('Sending')
  }

  return (
    <Result
      icon={<TransactionStatusIcon direction={direction} status={status} width={48} height={48} />}
      title={displayStatus}
    />
  )
}

const TransactionDescription = (props: { transaction: TransactionDetailModel; txHash: string; tokenName: string }) => {
  const { t } = useTranslation()
  const { transaction: tx, txHash, tokenName } = props
  const { amount, blockNumber, fee } = tx
  const { decimal, isCkb } = AssetManagerContainer.useContainer()

  return (
    <table>
      <tbody>
        <tr>
          <th>{t('Token')}</th>
          <td>
            <Token tokenName={tokenName} className="small" />
          </td>
        </tr>

        <tr>
          <th>{t('Amount')}</th>
          <td>
            <Balance value={amount} decimal={decimal} suffix={tokenName} maxDecimalPlaces={isCkb ? 8 : undefined} />
          </td>
        </tr>

        <tr>
          <th>{t('Transaction fee')}</th>
          <td>
            <Balance value={fee} decimal={8} suffix="CKB" maxDecimalPlaces={8} />
          </td>
        </tr>

        <tr>
          <td colSpan={2}>
            <Divider />
          </td>
        </tr>

        <tr>
          <th>{t('Hash')}</th>
          <td>
            <a target="_blank" rel="noopener noreferrer" href={`${EXPLORER_URL}transaction/${txHash}`}>
              {txHash}
            </a>
          </td>
        </tr>

        <tr>
          <th>{t('Block No.')}</th>
          <td>
            {blockNumber ? (
              <a target="_blank" rel="noopener noreferrer" href={`${EXPLORER_URL}block/${blockNumber}`}>
                {blockNumber}
              </a>
            ) : (
              '-'
            )}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export const TransactionDetail: React.FC = () => {
  const { tokenName, txHash } = useParams<{ tokenName: string; txHash: string }>()
  const { useSudt } = AssetManagerContainer.useContainer()
  const sudt = useSudt()

  const { data: tx, isLoading } = useQuery<TransactionDetailModel>(['transactions', tokenName, txHash], () => {
    const lock = PWCore.provider.address.toLockScript()
    if (tokenName === 'CKB') return getCkbTransactionDetail({ lock, txHash })
    asserts(sudt)
    return getSudtTransactionDetail({ lock, type: sudt.toTypeScript(), txHash })
  })
  const { t } = useTranslation()

  let descriptions: React.ReactNode
  if (isLoading) {
    descriptions = (
      <Result>
        <Spin />
      </Result>
    )
  } else if (tx) {
    descriptions = (
      <>
        <ResultMain status={tx.status as TransactionStatus} direction={tx.direction as TransactionDirection} />
        <Divider />
        <TransactionDescription transaction={tx} txHash={txHash} tokenName={tokenName} />
      </>
    )
  } else {
    descriptions = <UnknownResultMain />
  }

  return (
    <>
      <AssetManagerHeader showGoBack title={t('Transaction Detail')} />
      <TransactionDetailWrapper>{descriptions}</TransactionDetailWrapper>
    </>
  )
}
