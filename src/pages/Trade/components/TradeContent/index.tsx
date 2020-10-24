import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Table, Button, Input } from 'antd'
import axios from 'axios'
import { TRACE_TABLELIST } from '../../../../context/actions/types'
import { TraceTableList } from '../../../../utils/const'
import { TradeTableBox, FilterTablePire } from './styled'
import { traceState } from '../../../../context/reducers/trace'
import toExplorer from '../../../../assets/img/toExplorer.png'
import { walletState } from '../../../../context/reducers/wallet'

export default () => {
  const dispatch = useDispatch()
  const ordersList = useSelector(({ trace }: { trace: traceState }) => trace.ordersList)
  const { walletConnectStatus } = useSelector(({ wallet }: { wallet: walletState }) => wallet)
  useMemo(() => {
    if (walletConnectStatus === 'success') {
      axios.post('/getTableList').then(res => {
        if (res?.data) {
          dispatch({
            type: TRACE_TABLELIST,
            payload: {
              ordersList: res.data.list,
            },
          })
        }
      })
    }
  }, [walletConnectStatus, dispatch])
  const filterOrderList = (selectVal: string) => {
    // fetch filterTabeList
    // todo...
    // console.info(selectVal)
    return selectVal
  }

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
      title: 'Statue',
      dataIndex: 'status',
      key: 'status',
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
          case 'claim':
            return <Button shape="round">{column.action}</Button>
          case 'cancel':
            return <Button shape="round">{column.action}</Button>
          case 'location':
            return (
              <img
                src={toExplorer}
                alt="toExplorer"
                style={{
                  width: '15px',
                }}
              />
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
            <Button type="text" key={val} size="small" onClick={() => filterOrderList(val)}>
              {val}
            </Button>
          ))}
        </FilterTablePire>
      </div>
      <Table
        dataSource={ordersList}
        columns={columns}
        pagination={{
          pageSize: 10,
        }}
        rowKey={(record: any) => record.key}
      />
    </TradeTableBox>
  )
}
