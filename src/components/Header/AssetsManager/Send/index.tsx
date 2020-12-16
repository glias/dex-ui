import { Address, AddressType, Amount, AmountUnit, SimpleSUDTBuilder } from '@lay2/pw-core'
import { Divider, Form, Input } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import { BigNumber } from 'bignumber.js'
import Token from 'components/Token'
import { isCkbWallet } from 'containers/wallet'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { useHistory, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { CKB_MIN_CHANGE_CKB } from '../../../../constants/number'
import { AssetManagerHeader } from '../AssetManagerHeader'
import { Balance } from '../Balance'
import { ForceSimpleBuilder } from '../builders/SimpleBuilder'
import { Button } from '../components/Button'
import { asserts, debounce } from '../helper'
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
  const { t } = useTranslation()
  const [form] = Form.useForm<{ amount: string; to: string }>()
  const { push } = useHistory()
  const match = useRouteMatch()
  const { sudt, wallet, tokenName, decimal: decimals } = AssetManagerContainer.useContainer()
  const [shouldSendAllCkb, setShouldSendAllCkb] = useState(false)

  const freeAmount: BigNumber = useMemo(() => {
    if (!wallet) return new BigNumber(0)
    if (isCkbWallet(wallet)) return wallet.free
    return wallet.balance
  }, [wallet])

  const maxPayableAmount: BigNumber = freeAmount

  const [inputAllValidated, setInputAllValidated] = useState(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedValidateInput = useCallback(
    debounce(async () => {
      await form.validateFields(['amount', 'to'])

      setInputAllValidated(true)
    }, 200),
    [form, setInputAllValidated],
  )

  const { data: transactionFee } = useQuery<string, unknown>(
    ['getTransactionFee', tokenName, inputAllValidated, form.getFieldValue('amount'), decimals],
    async () => {
      const { amount, to } = form.getFieldsValue(['amount', 'to'])
      if (!inputAllValidated) return ''
      const toAddressType = to.startsWith('ck') ? AddressType.ckb : AddressType.eth
      const toAddress = new Address(to, toAddressType)

      if (tokenName === 'CKB') {
        const builder = new ForceSimpleBuilder(toAddress, new Amount(amount, decimals))
        await builder.build()

        return builder.getFee().toString()
      }

      asserts(sudt)

      const builder = new SimpleSUDTBuilder(sudt, toAddress, new Amount(amount, decimals))
      await builder.build()
      return builder.getFee().toString()
    },
    { enabled: inputAllValidated },
  )

  async function validateInput() {
    setInputAllValidated(false)
    debouncedValidateInput()
  }

  if (!wallet) return null

  async function validateAmount(_: any, input: any): Promise<void> {
    setShouldSendAllCkb(false)
    const isCkb = tokenName === 'CKB'
    asserts(wallet)
    const inputNumber = new BigNumber(input)
    asserts(input && !inputNumber.isNaN(), t(`Amount should be a valid number`))

    const balance = freeAmount
    asserts(inputNumber.lte(balance), t('Amount should be less than the MAX'))
    asserts(inputNumber.gt(0), t('Amount should be more than 0'))
    if (!isCkb) return

    asserts(inputNumber.decimalPlaces() <= decimals, t(`The value up to ${decimals} precision`))
    asserts(inputNumber.gte(61), t('Amount should be large than 61'))
    const remainLessThanBasicCellCapacity = balance.minus(inputNumber).lt(61)
    setShouldSendAllCkb(remainLessThanBasicCellCapacity)
  }

  async function validateAddress(_: any, input: string): Promise<void> {
    asserts(
      input && new Address(input, input.startsWith('ck') ? AddressType.ckb : AddressType.eth).valid(),
      t('Please input a valid address'),
    )
  }

  function setAllBalanceToAmount() {
    form.setFieldsValue({ amount: maxPayableAmount.toString() })
    validateInput()
  }

  const amountLabel = (
    <AmountControlLabelWrapper>
      <span>{t('Amount')}</span>
      <span
        tabIndex={0}
        role="button"
        className="amount"
        onClick={setAllBalanceToAmount}
        onKeyDown={setAllBalanceToAmount}
      >
        {t('MAX')}
        :&nbsp;
        <Balance value={maxPayableAmount} />
      </span>
    </AmountControlLabelWrapper>
  )

  const transactionFeeTip = (
    <div style={{ marginBottom: '16px' }}>
      <div>{t('Transaction fee')}</div>
      <div>{transactionFee ? <Balance value={transactionFee} suffix="CKB" maxDecimalPlaces={8} /> : '-'}</div>
    </div>
  )

  function onFinish(data: { to: string; amount: string }) {
    const { to, amount: inputAmount } = data
    const decimals = sudt ? sudt.info?.decimals ?? 0 : AmountUnit.ckb

    const amount = new Amount(inputAmount, decimals).toString(0)
    const confirmUrl = `${match.url}/confirm?to=${to}&amount=${amount}&fee=${transactionFee}`
    push(confirmUrl)
  }

  const amountFormItemProps: FormItemProps = shouldSendAllCkb
    ? {
        validateStatus: 'warning',
        help: t(
          `The remaining balance is too small(less than 61 CKB). So the transaction won't succeed. You can send less than {{lessRemain}} CKB out. \n Or do you want to send ALL your CKB out?`,
          { lessRemain: freeAmount.minus(CKB_MIN_CHANGE_CKB) },
        ),
      }
    : {}

  return (
    <>
      <AssetManagerHeader title={t('Send')} showGoBack />
      <SendWrapper>
        <Form form={form} onValuesChange={validateInput} autoComplete="off" layout="vertical" onFinish={onFinish}>
          <Form.Item label={t('Token')}>
            <Token tokenName={tokenName} />
          </Form.Item>
          <Form.Item
            label={t('To')}
            name="to"
            rules={[{ validator: validateAddress, validateTrigger: ['onChange', 'onBlur'] }]}
          >
            <Input.TextArea rows={4} placeholder={t('To')} />
          </Form.Item>
          {amountLabel}
          <Form.Item
            {...amountFormItemProps}
            rules={[{ validator: validateAmount, validateTrigger: ['onChange', 'onBlur'] }]}
            name="amount"
          >
            <Input suffix={tokenName} placeholder={t('Amount')} type="number" size="large" />
          </Form.Item>
          <Divider />
          {transactionFeeTip}

          <Form.Item>
            <Button htmlType="submit" size="large" block disabled={!inputAllValidated || !transactionFee}>
              {shouldSendAllCkb ? t('Send All My CKB') : t('Send')}
            </Button>
          </Form.Item>
        </Form>
      </SendWrapper>
    </>
  )
}
