import styled from 'styled-components'

export const PairOrderFormBox = styled.div`
  overflow: hidden;
  position: relative;
  color: rgba(102, 102, 102, 1);
  box-sizing: border-box;
  .popover-overlay {
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
      input[type='number'] {
        appearance: textfield;
      }
      input[type='number']::-webkit-inner-spin-button {
        appearance: none;
      }
      input[type='number']::-webkit-outer-spin-button {
        margin: 0;
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
    .submit-btn {
      padding: 0;
      font-size: 17px;
      font-weight: 500;
      height: 60px;
      width: 100%;
      line-height: 60px;
      color: rgba(0, 106, 151, 1);
      text-align: center;
      &[disabled] {
        background: rgba(241, 241, 241, 1);
        border-bottom-right-radius: 10px;
        border-bottom-left-radius: 10px;
      }
    }
  }
`

export const OrderSelectPopover = styled.div`
  width: 100%;
  padding: 10px 10px 30px;
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
  .pair-trace-box {
    display: flex;
    padding: 0 10px;
    height: 40px;
    width: 100%;
    line-height: 40px;
    cursor: pointer;
    &: hover {
      background: #f2f4f5;
    }
    .decollete {
      padding: 0 10px;
      color: rgba(136, 136, 136, 1);
    }
  }
`
