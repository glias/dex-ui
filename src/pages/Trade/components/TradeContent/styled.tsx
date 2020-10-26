import styled from 'styled-components'

export const TradeTableBox = styled.div`
  overflow: hidden;
  background: #fff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12);
  border: 1px solid #abd1e1;
  box-sizing: border-box;
  border-radius: 10px;
  .tableHederBox {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(81, 119, 136, 1);
    color: #fff;
    height: 50px;
    .tableHeaderSearch {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .table-header-input {
        color: rgba(136, 136, 136, 1);
        background: #ecf2f4;
        border-radius: 10px;
        height: 28px;
        width: 120px;
        input {
          background: #ecf2f4;
          color: rgba(136, 136, 136, 1);
        }
      }
      h3 {
        color: #fff;
        font-size: 16px;
        margin: 0 10px 0;
        padding: 0;
      }
    }

    button {
      color: #fff;
      font-size: 14px;
    }
  }
`

export const FilterTablePire = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #fff;
`
