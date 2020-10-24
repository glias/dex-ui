/* eslint-disable react/jsx-curly-newline */
import React, { useCallback, useEffect } from 'react'
import { useContainer } from 'unstated-next'
import { Table, Button, Input, Spin } from 'antd'
import PWCore, { Address, Amount, OutPoint, AddressType } from '@lay2/pw-core'
import { TraceTableList } from '../../../../utils/const'
import { TradeTableBox, FilterTablePire } from './styled'
import toExplorer from '../../../../assets/img/toExplorer.png'
import { titleCase } from '../../../../lib/string'
// import { useDidMount } from '../../../../hooks'
import OrderContainer from '../../../../containers/order'
import CancelOrderBuilder from '../../../../pw/cancelOrderBuilder'
import WalletContainer from '../../../../containers/wallet'
import { getHistoryOrders } from '../../../../APIs'

const RECEIVE_UNIT = 10 * 1000 * 1000 * 1000
const PRICE_UNIT = 100 * 1000 * 1000

export default () => {
  const Order = useContainer(OrderContainer)
  const Wallet = useContainer(WalletContainer)

  const ordersList: any[] = Order.historyOrders

  useEffect(() => {
    if (Wallet.ckbWallet.address === '') {
      return
    }
    const lockArgs = PWCore.provider.address.toLockScript().args
    getHistoryOrders(lockArgs).then(res => {
      Order.concatHistoryOrders(
        res.data.map((item: any) => {
          const txHash = item.last_order_cell_outpoint.tx_hash
          return {
            ...item,
            status: item.status,
            executed: item.turnover_rate * 100,
            key: txHash,
            txHash,
            price: `${item.price / PRICE_UNIT} USDT per DAI`,
            receive: `${item.traded_amount / RECEIVE_UNIT} ${item.is_bid ? 'CKB' : 'SUDT'}`,
            // eslint-disable-next-line no-nested-ternary
            action: item.claimable ? 'claimed' : item.status === 'open' ? 'cancel' : 'location',
          }
        }),
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Wallet.ckbWallet.address])

  const onCancel = useCallback(
    async (txHash: string) => {
      // eslint-disable-next-line no-debugger
      // debugger
      Order.setLoading(txHash)
      const order = ordersList.find((o: any) => o.last_order_cell_outpoint.tx_hash === txHash)
      const outpoint = order.last_order_cell_outpoint

      const builder = new CancelOrderBuilder(
        new Address(Wallet.ckbWallet.address, AddressType.ckb),
        new OutPoint(outpoint.tx_hash, outpoint.index),
        new Amount('80'),
      )

      try {
        const hash = await Wallet.pw?.sendTransaction(await builder.build())
        console.log(hash)
      } catch (error) {
        //
      } finally {
        Order.setLoading(txHash)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ordersList, Wallet.pw, Wallet.ckbWallet.address, Order.setLoading],
  )

  const columns = [
    {
      title: 'Pay',
      dataIndex: 'pay',
      key: 'pay',
    },
    {
      title: 'Receive',
      dataIndex: 'receive',
      key: 'receive',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <span
          style={{
            color: ['completed', 'claimed'].includes(value) ? 'rgba(136, 136, 136, 1)' : 'rgba(0, 0, 0, 1)',
          }}
        >
          {titleCase(value)}
        </span>
      ),
    },
    {
      title: 'Executed',
      dataIndex: 'executed',
      key: 'executed',
      render: (value: any) => (value ? `${value} %` : '--'),
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (column: any) => {
        switch (column.action) {
          case 'claimed':
            return (
              <Button
                shape="round"
                disabled={column.loading}
                style={{
                  color: 'rgba(102, 102, 102, 1)',
                }}
                onClick={() => {
                  // eslint-disable-next-line no-debugger
                  onCancel(column.key)
                }}
              >
                {column.loading ? <Spin /> : 'Claim'}
              </Button>
            )
          case 'cancel':
            return (
              <Button
                shape="round"
                style={{
                  color: 'rgba(102, 102, 102, 1)',
                }}
                disabled={column.loading}
                onClick={() => {
                  // eslint-disable-next-line no-debugger
                  onCancel(column.key)
                }}
              >
                {column.loading ? <Spin /> : 'Cancel'}
              </Button>
            )
          case 'location':
            return (
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={`https://explorer.nervos.org/aggron/transaction/${column.key}`}
              >
                <img
                  src={toExplorer}
                  alt="toExplorer"
                  style={{
                    width: '15px',
                  }}
                />
              </a>
            )
          default:
            return column.action
        }
      },
    },
  ]

  return (
    <TradeTableBox>
      <div className="tableHederBox">
        <div className="tableHeaderSearch">
          <h3>My Orders</h3>
          <Input
            placeholder="Filter Token"
            style={{
              width: '180px',
              color: 'rgba(136, 136, 136, 1)',
            }}
            prefix={<i className="ai-search" />}
          />
        </div>
        <FilterTablePire>
          {TraceTableList.map(val => (
            <Button type="text" key={val} size="small">
              {val}
            </Button>
          ))}
        </FilterTablePire>
      </div>
      <Table
        dataSource={ordersList}
        columns={columns}
        size="small"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
        rowKey={(record: any) => record.key}
      />
    </TradeTableBox>
  )
}
