import React from 'react'
import ConfirmButton from 'components/ConfirmButton'
import { useContainer } from 'unstated-next'
import i18n from '../../../../utils/i18n'
import { Container, Result } from './styled'
import OrderContainer, { OrderStep } from '../../../../containers/order'
import { ReactComponent as SuccessSVG } from '../../../../assets/svg/order-placed.svg'
import { EXPLORER_URL } from '../../../../constants'

export default function Trade() {
  const Order = useContainer(OrderContainer)
  const handleClickSubmit = () => {
    Order.setStep(OrderStep.Order)
  }

  return (
    <Container>
      <Result>
        <div className="success">
          <div className="order-place">
            <SuccessSVG />
          </div>
          <div className="order-tip">{i18n.t('trade.orderSubmitted')}</div>
          <a target="_blank" rel="noreferrer noopener" href={`${EXPLORER_URL}transaction/${Order.txHash}`}>
            {i18n.t('trade.viewExplorer')}
          </a>
        </div>
      </Result>
      <ConfirmButton htmlType="button" text={i18n.t('trade.dismiss')} onClick={handleClickSubmit} />
    </Container>
  )
}
