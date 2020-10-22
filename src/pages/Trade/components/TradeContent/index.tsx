import React from 'react'
import { Table, Button, Input } from 'antd'
import { connect } from 'react-redux'
import { TraceTableList } from '../../../../utils/const'

import { TradeTableBox, FilterTablePire } from './styled'

const mapStateToProps = ({ trace }: { trace: State.TraceState }) => {
  return {
    ordersList: trace.ordersList,
    tableHeaderColumn: trace.tableHeaderColumn,
  }
}

const tradeContent = ({
  ordersList,
  tableHeaderColumn,
}: {
  ordersList: Array<object>
  tableHeaderColumn: Array<object>
}) => {
  // console.info(ordersList, tableHeaderColumn)

  // fetch tableData
  // todo...

  const filterOrderList = (selectVal: string) => {
    // fetch filterTabeList
    // todo...
    // console.info(selectVal)
    return selectVal
  }

  return (
    <TradeTableBox>
      <div className="tableHederBox">
        <div className="tableHeaderSearch">
          <h3>My Orders</h3>
          <Input
            placeholder="Filter Token"
            style={{
              width: '180px',
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
      <Table dataSource={ordersList} columns={tableHeaderColumn} />
    </TradeTableBox>
  )
}

export default connect(mapStateToProps)(tradeContent)
