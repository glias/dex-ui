import React, { ReactElement } from 'react'
import renderer from 'react-test-renderer'
import Header from '../../../components/Header'

describe('Header Component render', () => {
  let component: ReactElement

  beforeAll(() => {
    component = <Header />
  })

  it('shallow renders', () => {
    const wrapper = renderer.create(component).toJSON()
    expect(wrapper).toMatchSnapshot()
  })
})
