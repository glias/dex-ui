import { Col, List, Row, Spin, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { SUDT_LIST } from '../../../../constants/sudt'
import { getCkbTransferSummaries, getSudtTransferSummaries, TransactionDirection, TransactionSummary } from '../api'
import { Balance } from '../Balance'
import { RadioItem, RadioTabs } from '../components/RadioTabs'
import { TransactionStatusIcon } from '../components/TransactionStatus'
import { AssetManagerContainer } from '../hooks'

const { Text, Title } = Typography

interface TransactionListItemProps {
  transaction: TransactionSummary
}

const SpinWrapper = styled.div`
  padding: 30px;
  text-align: center;
`

const TransactionListItemWrapper = styled.div`
  font-size: 12px;
  padding: 16px;
  cursor: pointer;

  :nth-child(odd) {
    background: #f6f6f6;
  }

  .ant-row {
    flex-wrap: nowrap;
  }

  .ant-col {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .amount {
    font-weight: bold;
  }
  .symbol {
    padding-right: 8px;
  }
`

const TransactionListItem: React.FC<TransactionListItemProps> = (props: TransactionListItemProps) => {
  const { transaction: tx } = props
  const { push } = useHistory()
  const { isCkb, decimal } = AssetManagerContainer.useContainer()

  return (
    <TransactionListItemWrapper onClick={() => push(`/assets/${tx.tokenName}/transactions/${tx.txHash}`)}>
      <Row gutter={8} align="middle">
        <Col flex="40px">
          <TransactionStatusIcon status={tx.status} direction={tx.direction} filled width={18} />
        </Col>
        <Col flex="auto">
          <Row gutter={8}>
            <Col flex="auto">
              <Tooltip title={tx.txHash}>{tx.txHash}</Tooltip>
            </Col>
            <Col flex="none">
              <Text type="secondary">{tx.date}</Text>
            </Col>
          </Row>
          <Row justify="end" className="amount" style={{ paddingTop: '4px' }}>
            <span className="symbol">{tx.direction === 'in' ? '+' : '-'}</span>
            <Balance
              value={tx.amount}
              suffix={tx.tokenName}
              maxDecimalPlaces={isCkb ? 8 : undefined}
              decimal={decimal}
            />
          </Row>
        </Col>
      </Row>
    </TransactionListItemWrapper>
  )
}

const TransactionListWrapper = styled.div`
  .ant-list {
    max-height: 285px;
    overflow: auto;
  }
`

export const TransactionList = () => {
  const { t } = useTranslation()
  const [transferDirection, setTransferDirectionFilter] = useState<'all' | TransactionDirection>('all')
  const { tokenName } = AssetManagerContainer.useContainer()

  const { data: txs, isLoading } = useQuery<TransactionSummary[]>(
    ['transactions', tokenName, transferDirection],
    () => {
      const direction = transferDirection === 'all' ? undefined : transferDirection
      if (tokenName === 'CKB') return getCkbTransferSummaries({ direction })

      const sudt = SUDT_LIST.find(sudt => sudt.info?.name === tokenName)
      if (!sudt) return []
      return getSudtTransferSummaries({ sudt, direction })
    },
  )

  function onDirectionChange(direction: string) {
    setTransferDirectionFilter(direction as 'all' | TransactionDirection)
  }

  if (isLoading)
    return (
      <SpinWrapper>
        <Spin size="large" tip="loading..." />
      </SpinWrapper>
    )
  const transferList =
    txs && txs.length ? (
      txs.map((tx: TransactionSummary) => <TransactionListItem key={tx.txHash} transaction={tx} />)
    ) : (
      <Title style={{ textAlign: 'center', padding: '16px' }} level={3} type="secondary">
        {t('No related transactions')}
      </Title>
    )

  return (
    <TransactionListWrapper>
      <RadioTabs
        style={{ boxShadow: '3px 3px 8px rgba(0, 0, 0, 0.08)' }}
        mode="underline"
        value={transferDirection}
        onChange={onDirectionChange}
      >
        <RadioItem key="all">{t('All')}</RadioItem>
        <RadioItem key="in">{t('In')}</RadioItem>
        <RadioItem key="out">{t('Out')}</RadioItem>
      </RadioTabs>

      <List>{transferList}</List>
    </TransactionListWrapper>
  )
}
