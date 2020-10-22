import styled from 'styled-components'

export const TradePage = styled.div`
  background-color: #ECF2F4;
  min-height: calc(100% - 50px);
  padding: 10px 50px 0;
  box-sizing: border-box;
  .asider {
    flex: 0 0 250px;
    min-width: 250px;
  }
`

export const TracePairLine = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 42px;
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid rgba(171, 209, 225, 1);
  span {
    text-align: center;
    font-size: 16px;
  }
`

export const TradeContent = styled.div`
  box-size: border-box;
  background-color: #ECF2F4;
`

export const PopverContent = styled.div`
  width: 290px;
  color: red;
  input {
    width: calc(100% - 50px);
    margin: 10px;
    background-color: rgba(236, 242, 244, 1);
  }
  .dividingLine {
    margin: 0 0 10px;
    border-bottom: 1px solid #d9d9d9;
  }
`

export const TradeForm = styled.div`
  background-color: #fff;
  overflow: hidden;
  border: 1px solid rgba(171, 209, 225, 1);
  .pairSelect {
    padding: 0 10px;
    cursor: pointer;
    .pairLine {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      font-size: 14px;
      .pairLeft {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .pair {
          margin-right: 10px;
          font-weight: bolder;
        }
        .decollect {
          padding: 0 10px;
          color: rgba(81, 119, 136, 1);
        }
      }
    }
  }
`

export const ConectIconBox = styled.div`
  text-align: center;
`