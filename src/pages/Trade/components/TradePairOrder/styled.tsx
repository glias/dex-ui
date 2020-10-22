import styled from 'styled-components'

export const PairOrder = styled.div`
  border: 1px solid rgba(171, 209, 225, 1);
  overflow: hidden;
  color: rgba(102, 102, 102, 1);
  background: #fff;
  margin-top: 10px;
  padding-top: 10px;
  box-sizing: border-box;
  .ant-form-item {
    padding: 0 10px;
    label {
      font-size: 16px;
    }
  }
  .priceBox {
    margin: 0;
  }
  .dividingLine {
    width: 100%;
    border-bottom: 1px solid rgba(171, 209, 225, 1);
  }
  .ant-input-affix-wrapper,
  input {
    border-color: rgba(171, 209, 225, 1);
    background: #ecf2f4;
  }
  input {
    font-weight: 500;
    font-size: 20px;
  }
  .receiveBox {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    color: rgba(81, 119, 136, 1);
    .receiverCkb {
      font-weight: 500px;
      font-size: 28px;
      color: rgba(0, 0, 0, 1);
    }
  }
  .submit-item {
    padding: 0;
    margin: 0;
    .submitBtn {
      font-size: 17px;
      font-weight: 500;
      color: #006a97;
      text-align: center;
      display: flex;
      width: 100%;
      justify-content: center;
    }
  }
`

export const PayMeta = styled.div`
  position: absolute;
  top: -30px;
  right: 0;
  font-size: 13px;
  color: rgba(102, 102, 102, 1);
  span.maxNum {
    margin-right: 5px;
  }
`
