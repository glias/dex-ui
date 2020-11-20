import styled from 'styled-components'

export const InputNumberContainer = styled.div`
  .ant-form {
    background: #fff;
    .ant-form-item {
      label {
        font-size: 16px;
      }
      input[type='number'] {
        appearance: textfield;
        padding-left: 14px;
        font-size: 24px;
        line-height: 29px;
        color: #000000;
        height: 34px;
      }
      .ant-input-affix-wrapper-lg {
        padding: 10px;
      }
      input[type='number']::-webkit-inner-spin-button {
        appearance: none;
      }
      input[type='number']::-webkit-outer-spin-button {
        margin: 0;
      }
    }
    .ant-input-suffix {
      font-size: 12px;
      line-height: 14px;
      color: #888888;
      align-items: flex-end;
    }
  }
  .ant-input-affix-wrapper,
  input {
    background: #f6f6f6;
    border: 1px solid #e1e1e1;
    border-radius: 16px;
  }
`

export const OrderTableContainer = styled(InputNumberContainer)`
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
      line-height: 60px;
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

  button {
    border: none;
    background-color: white;
    color: #5c61da;
    font-size: 12px;
    line-height: 14px;
    text-decoration: underline;
    margin-right: 4px;
    cursor: pointer;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`

export const PairBlock = styled.div`
  font-size: 16px;
  display: flex;
  padding-left: 20px;
  .pair-trace-box {
    display: flex;
    padding: 0 10px;
    height: 40px;
    width: 100%;
    line-height: 40px;
    cursor: pointer;
    &:hover {
      background: #f2f4f5;
    }
    .decollete {
      padding: 0 10px;
      color: rgba(136, 136, 136, 1);
    }
  }
`

export const Header = styled.div`
  h3 {
    font-size: 18px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #000000;
  }
`
