import styled from 'styled-components'

export const PairOrderFormBox = styled.div`
  overflow: hidden;
  position: relative;
  color: rgba(102, 102, 102, 1);
  box-sizing: border-box;

  // remove form input[type=number] default style
  input[type='number'] {
    appearance: textfield;
  }
  input::-webkit-textfield-decoration-container {
    background-color: #ecf2f4;
  }
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  .popver-overlay {
    width: 100%;
    .ant-popover-content {
      margin-top: -10px;
      border: 1px solid rgba(171, 209, 225, 1);
    }
  }
  .ant-form {
    background: #fff;
    margin-top: 10px;
    padding-top: 10px;
    border-radius: 10px;
    border: 1px solid rgba(171, 209, 225, 1);
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.12);
    .ant-form-item {
      padding: 0 20px;
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
    padding: 0 !important;
    margin: 0;
    height: 60px;
    text-align: center;
    .submitBtn {
      padding: 0;
      font-size: 17px;
      font-weight: 500;
      height: 60px;
      width: 100%;
      color: rgba(0, 106, 151, 1);
      text-align: center;
    }
    .submitBtn[disabled] {
      background: rgba(241, 241, 241, 1);
      border-bottom-right-radius: 10px;
      overflow: hidden;
      border-bottom-left-radius: 10px;
    }
  }
`

export const OrderSelectPopver = styled.div`
  width: 100%;
  padding: 10px 10px 30px;
`

export const OrderSelectBox = styled.div`
  position: relative !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  height: 42px;
  line-height: 42px;
  background: #fff;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(171, 209, 225, 1);
  .pair {
    padding-left: 20px;
  }
  .ant-select-selector {
    border: 1px solid rgba(171, 209, 225, 1);
  }
  .pairTraceList {
    color: red;
    &: hover {
      background: transparent !important;
    }
  }
`

export const PayMeta = styled.div`
  position: absolute;
  top: -30px;
  right: 0;
  font-size: 13px;
  color: rgba(102, 102, 102, 1);
  .form-label-meta-num {
    margin: -30px 5px 0 0;
    color: rgba(102, 102, 102, 1);
    padding: 0;
    text-decoration: underline;
    span {
      text-decoration: underline;
    }
  }
`

export const PairBlock = styled.div`
  font-size: 16px;
  display: flex;
  .pairTraceList {
    display: flex;
    padding: 0 10px;
    height: 40px;
    width: 100%;
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
