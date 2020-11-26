import styled from 'styled-components'

export const TracePairResultBox = styled.div`
  height: 400px;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  border: 1px solid #abd1e1;
  box-sizing: border-box;
  overflow: hidden;
`

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const Result = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .success {
    text-align: center;
  }
  .order-tip {
    margin-top: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  a {
    font-size: 14px;
    color: #5c61da;
    text-decoration: underline;
    margin-top: 20px;
  }
`

export const TradePairConfirmBox = styled.div`
  height: 100%;
  background: #fff;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.12);
  border: 1px solid #abd1e1;
  .confirm-btn {
    font-size: 17px;
    font-weight: 500;
    color: #006a97;
    text-align: center;
    display: flex;
    border: 0;
    width: 100%;
    justify-content: center;
  }
`

export const OrderButton = styled.div`
  border-top: 1px solid rgba(171, 209, 225, 1);
  height: 60px;
  line-height: 60px;
  text-align: center;
  button {
    width: 100%;
  }
`

export const TradePairConfirmHeader = styled.div`
  height: 48px;
  line-height: 48px;
  background: rgba(0, 106, 151, 1);
  color: #fff;
  padding: 0 10px 0 0;
  font-size: 16px;
  box-sizing: border-box;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  button {
    float: left;
    color: #fff;
    position: absolute;
    top: 4px;
    left: 0;
  }
  span {
    display: inline-block;
  }
`

export const TradePairConfirmContent = styled.div`
  flex: 1;
  .circle-icon {
    width: 100px;
    color: rgba(136, 136, 136, 1);
  }
  .trace-success,
  .trace-failed {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    .order-tip {
      padding: 10px 0 14px;
    }
    a {
      display: flex;
      justify-content: center;
      text-decoration: underline;
      color: rgba(102, 102, 102, 1);
      .explorer-svg {
        display: inline;
        width: 15px;
        float: right;
        color: rgba(136, 136, 136, 1);
        margin-left: 4px;
      }
    }
  }
`

export const PairOrder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  font-size: 20px;
  background: rgba(241, 241, 241, 1);
  color: rgba(0, 0, 0, 1);
  button {
    width: 100px;
    color: rgba(136, 136, 136, 1);
  }
`

export const OrderBox = styled.div`
  background: #fff;
  padding: 10px 0;
  ul {
    .ant-divider {
      min-width: 80%;
      width: 80%;
      margin: 20px auto;
      background: rgba(171, 209, 225, 1);
    }
    .execution-fee {
      color: rgba(81, 119, 136, 1) !important;
      i {
        font-size: 12px;
      }
    }
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 40px;
      div {
        display: inline-block;
        text-align: right;
        font-weight: 300;
        &:first-child {
          text-align: left;
          text-indent: 10px;
        }
        &:last-child {
          font-weight: 400;
        }
        span {
          &:first-child {
            color: rgba(0, 0, 0, 1);
            font-weight: 500;
          }
          &:last-child {
            width: 85px;
            margin-left: 5px;
            font-size: 14px;
            display: inline-block;
            text-align: left;
          }
        }
      }
    }
  }
`
