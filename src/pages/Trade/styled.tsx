import styled from 'styled-components'

export const TradePage = styled.div`
  width: 100%;
  background-color: #ECF2F4;
  min-height: calc(100% - 120px);
  .formBox {
    border: 1px solid #e8e8e8;
    .header {
      padding: 5px 10px;
      border-bottom: 1px solid #e8e8e8;
    }
    .form {
      padding: 10px;
      .max-btn {
        float: right;
        margin-bottom: 10px;
      }
    }
  }
`
export const TradeContent = styled.div`
  margin: 0 120px;
  padding: 10px 0 0;
  box-size: border-box;
`
export const TradeForm = styled.div`
  width: 400px;
  height: 574px;
  background-color: #fff;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 10px;
`

export const ConectIconBox = styled.div`
  text-align: center;
`