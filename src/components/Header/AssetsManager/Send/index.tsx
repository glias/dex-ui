import { CaretDownOutlined } from '@ant-design/icons'
import { Address, AddressType, Amount, AmountUnit, SimpleSUDTBuilder } from '@lay2/pw-core'
import { Divider, Form, Input } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import { BigNumber } from 'bignumber.js'
import Token from 'components/Token'
import WalletContainer, { isCkbWallet, isSudtWallet, Wallet } from 'containers/wallet'
import i18n from 'i18next'
import React, { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { useEventCallback } from 'rxjs-hooks'
import { debounceTime, switchMap, tap } from 'rxjs/operators'
import styled from 'styled-components'
import { CKB_MIN_CHANGE_CKB } from '../../../../constants'
import SelectToken from '../../../SelectToken'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Balance } from '../Balance'
import { ForceSimpleBuilder } from '../builders/SimpleBuilder'
import { Button } from '../components/Button'
import { asserts, wrapAddress } from '../helper'
import { AssetManagerContainer } from '../hooks'

const SendWrapper = styled.div`
  padding: 16px 24px;

  .ant-form,
  .ant-form-item-label > label {
    color: #000;
  }

  .send-header {
    text-align: center;
    padding: 16px;
  }

  .ant-input {
    background: #f6f6f6;
    height: 34px;
    padding: 10px;
  }

  .ant-form-item-control {
    padding: 0 14px;
  }

  .ant-input-affix-wrapper {
    background: #f6f6f6;
    border-radius: 16px;
  }

  textarea {
    border-radius: 16px;
  }

  /* Chrome, Safari, Edge, Opera */

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */

  input[type='number'] {
    -moz-appearance: textfield;
  }

  // rewrite the SelectToken style
  .current {
    margin-top: 0;
  }

  .select-token {
    cursor: pointer;

    .anticon-caret-down {
      position: relative;
      top: 5px;
      float: right;
    }
  }
`

const AmountControlLabelWrapper = styled.div`
  padding-bottom: 8px;

  .amount,
  .balance-value,
  .balance-decimals {
    color: #5c61da;
  }

  .amount {
    float: right;
    cursor: pointer;
    border-bottom: 1px solid #5c61da;
    position: relative;
    top: 4px;
    line-height: 1;
  }
`

export const Send: React.FC = () => {
  const [viewMode, setViewMode] = useState<'send' | 'select'>('send')
  const [form] = Form.useForm<{ amount: string; to: string }>()
  const { push, replace } = useHistory()
  const match = useRouteMatch()
  const { ckbWallet } = WalletContainer.useContainer()
  const { sudt, wallet, tokenName, decimal, setTokenName, sendHelper } = AssetManagerContainer.useContainer()
  const [shouldSendAllCkb, setShouldSendAllCkb] = useState(false)
  const [shouldSendSudtWithCkb, setShouldSendSudtWithCkb] = useState(false)

  const freeAmount: BigNumber = useMemo(() => {
    if (!wallet) return new BigNumber(0)
    if (isCkbWallet(wallet)) return wallet.free
    return wallet.balance
  }, [wallet])

  const maxPayableAmount: BigNumber = freeAmount

  const [inputAllValidated, setInputAllValidated] = useState(false)
  const [debouncedValidateInput] = useEventCallback<undefined>(events$ => {
    return events$.pipe(
      tap(() => setInputAllValidated(false)),
      debounceTime(500),
      switchMap(() =>
        form.validateFields(['amount', 'to']).then(
          () => setInputAllValidated(true),
          () => setInputAllValidated(false),
        ),
      ),
    )
  })

  const { data: transactionFee } = useQuery<string, unknown>(
    ['getTransactionFee', tokenName, inputAllValidated, form.getFieldValue('amount'), decimal],
    async () => {
      const { amount, to } = form.getFieldsValue(['amount', 'to'])
      if (!inputAllValidated) return ''
      const toAddressType = to.startsWith('ck') ? AddressType.ckb : AddressType.eth
      const toAddress = new Address(to, toAddressType)

      if (tokenName === 'CKB') {
        const builder = new ForceSimpleBuilder(toAddress, new Amount(amount, decimal))
        await builder.build()

        return builder.getFee().toString()
      }

      asserts(sudt)

      const builder = new SimpleSUDTBuilder(sudt, toAddress, new Amount(amount, decimal))
      await builder.build()
      return builder.getFee().toString()
    },
    { enabled: inputAllValidated },
  )

  async function validateInput() {
    debouncedValidateInput()
  }

  async function validateAmount(_: any, input: any): Promise<void> {
    setShouldSendAllCkb(false)
    const isCkb = tokenName === 'CKB'
    asserts(wallet)
    const inputNumber = new BigNumber(input)
    asserts(input && !inputNumber.isNaN(), i18n.t(`Amount should be a valid number`))

    const balance = freeAmount
    asserts(inputNumber.lte(balance), i18n.t('Amount should be less than the MAX'))
    asserts(inputNumber.gt(0), i18n.t('Amount should be more than 0'))
    if (!isCkb) return

    asserts(inputNumber.decimalPlaces() <= decimal, i18n.t(`The value up to ${decimal} precision`))
    asserts(inputNumber.gte(61), i18n.t('Amount should be large than 61'))
    const remainLessThanBasicCellCapacity = balance.minus(inputNumber).lt(61)
    setShouldSendAllCkb(remainLessThanBasicCellCapacity)
  }

  async function validateAddress(_: any, input: string): Promise<void> {
    asserts(wallet)
    asserts(input, i18n.t('Please input a valid address'))

    const address = wrapAddress(input)
    asserts(address.valid(), i18n.t('Please input a valid address'))

    asserts(ckbWallet.address !== address.toCKBAddress(), 'This address is the current user')

    setShouldSendSudtWithCkb(false)
    if (isSudtWallet(wallet)) {
      asserts(sudt)
      const acpAddress = await sendHelper.searchOrCheckIsAcpAddress(sudt, input)
      if (!acpAddress) setShouldSendSudtWithCkb(true)
    }
  }

  function setAllBalanceToAmount() {
    form.setFieldsValue({ amount: maxPayableAmount.toString() })
    validateInput()
  }

  const amountLabel = (
    <AmountControlLabelWrapper>
      <span>{i18n.t('Amount')}</span>
      <span
        tabIndex={0}
        role="button"
        className="amount"
        onClick={setAllBalanceToAmount}
        onKeyDown={setAllBalanceToAmount}
      >
        {i18n.t('MAX')}
        :&nbsp;
        <Balance value={maxPayableAmount} />
      </span>
    </AmountControlLabelWrapper>
  )

  const transactionFeeTip = (
    <div style={{ marginBottom: '16px' }}>
      <div>{i18n.t('Transaction fee')}</div>
      <div>{transactionFee ? <Balance value={transactionFee} suffix="CKB" maxDecimalPlaces={8} /> : '-'}</div>
    </div>
  )

  function onFinish(data: { to: string; amount: string }) {
    const { to, amount: inputAmount } = data
    const decimals = sudt ? sudt.info?.decimals ?? 0 : AmountUnit.ckb

    const amount = new Amount(inputAmount, decimals).toString(0)
    const forceSendSudtWithCkb = shouldSendSudtWithCkb ? 1 : 0
    const confirmUrl = `${match.url}/confirm?to=${to}&amount=${amount}&fee=${transactionFee}&force=${forceSendSudtWithCkb}`
    push(confirmUrl)
  }

  const amountFormItemProps: FormItemProps = useMemo(() => {
    if (!shouldSendAllCkb) return {}
    return {
      validateStatus: 'warning',
      help: i18n.t(
        `The remaining balance is too small(less than 61 CKB). So the transaction won't succeed. You can send less than {{lessRemain}} CKB out. \n Or do you want to send ALL your CKB out?`,
        { lessRemain: freeAmount.minus(CKB_MIN_CHANGE_CKB) },
      ),
    }
  }, [shouldSendAllCkb, freeAmount])

  const addressFormItemProps: FormItemProps = useMemo(() => {
    if (!shouldSendSudtWithCkb) return {}
    return {
      validateStatus: 'warning',
      help: i18n.t(
        `This address can not accept this asset without the asset account. \n Or do you want to send this asset associated with 142 CKB to create a asset account for this address ?`,
      ),
    }
  }, [shouldSendSudtWithCkb])

  function onTokenSelect(tokenName: string) {
    setTokenName(tokenName)
    replace(`/assets/${tokenName}/send`)
    setViewMode('send')
  }

  const tokenFilter = (wallet: Wallet) => isCkbWallet(wallet) || isSudtWallet(wallet)

  const sendButtonText = useMemo(() => {
    if (shouldSendAllCkb) return i18n.t('Send All My CKB')
    if (shouldSendSudtWithCkb) return i18n.t('Send Asset with 142 CKB')
    return i18n.t('Send')
  }, [shouldSendSudtWithCkb, shouldSendAllCkb])

  const getView = () => {
    if (!wallet) return null
    if (viewMode === 'select') {
      return (
        <SelectToken
          currentToken={tokenName}
          filter={tokenFilter}
          onSelect={wallet => onTokenSelect(wallet.tokenName)}
        />
      )
    }
    return (
      <Form form={form} onValuesChange={validateInput} autoComplete="off" layout="vertical" onFinish={onFinish}>
        <Form.Item label={i18n.t('Token')}>
          <div
            className="select-token"
            role="button"
            tabIndex={0}
            onKeyDown={() => setViewMode('select')}
            onClick={() => setViewMode('select')}
          >
            <Token tokenName={tokenName} className="small" />
            <CaretDownOutlined translate="select" />
          </div>
        </Form.Item>
        <Form.Item
          {...addressFormItemProps}
          label={i18n.t('To')}
          name="to"
          rules={[{ validator: validateAddress, validateTrigger: ['onChange', 'onBlur'] }]}
        >
          <Input.TextArea rows={4} placeholder={i18n.t('To')} />
        </Form.Item>
        {amountLabel}
        <Form.Item
          {...amountFormItemProps}
          rules={[{ validator: validateAmount, validateTrigger: ['onChange', 'onBlur'] }]}
          name="amount"
        >
          <Input suffix={tokenName} placeholder={i18n.t('Amount')} type="number" size="large" />
        </Form.Item>
        <Divider />
        {transactionFeeTip}

        <Form.Item>
          <Button htmlType="submit" size="large" block disabled={!inputAllValidated || !transactionFee}>
            {sendButtonText}
          </Button>
        </Form.Item>
      </Form>
    )
  }

  return (
    <>
      <AssetManagerHeader title={i18n.t('Send')} showGoBack />
      <SendWrapper>{getView()}</SendWrapper>
    </>
  )
}
