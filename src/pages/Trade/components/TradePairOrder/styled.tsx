import styled from 'styled-components'

export const PairOrderFormBox = styled.div`
  overflow: hidden;
  color: rgba(102, 102, 102, 1);
  box-sizing: border-box;
  .trace-form-select {
    cursor: pointer;
    height: 42px;
    line-height: 42px;
    box-sizing: border-box;
    .ant-select-selector {
      border: 1px solid rgba(171, 209, 225, 1);
    }
  }
  .ant-form {
    background: #fff;
    margin-top: 10px;
    padding-top: 10px;
    border: 1px solid rgba(171, 209, 225, 1);
    .ant-form-item {
      padding: 0 10px;
      label {
        font-size: 16px;
      }
    }
  }
  .price-box {
    margin: 0;
    padding: 0;
    .ant-form-item {
      padding: 0;
    }
  }
  .dividing-line {
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
  .receiver-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    color: rgba(81, 119, 136, 1);
    .receiver-ckb {
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
      border: 0;
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
  span.max-num {
    margin-right: 5px;
  }
`

export const PairBox = styled.div`
  font-size: 16px;
  display: flex;
  .pairTraceList {
    display: flex;
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    &: hover {
      background: #f2f4f5;
    }
    .decollect {
      padding: 0 10px;
      color: rgba(136, 136, 136, 1);
    }
  }
`
