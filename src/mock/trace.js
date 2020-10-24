import Mock from 'mockjs'

/* eslint-disable */
const tableList = () => {
  let list = []
  for(let i = 0; i < 500; i ++) {
    list.push(Mock.mock({
      key: Mock.mock('@guid'),
      pay: Mock.mock('@string("number", 1, 3)'),
      receive: Mock.mock('@string("number", 1, 3)'),
      price: Mock.mock('@string("number", 1, 3)'),
      conversionUnit: Mock.mock('@string("number", 1, 3)'),
      'status|1': ['Completed', 'Aborted', 'Opening', 'Claimed'],
      'executed|1': Math.random() > 0.5 ? Mock.mock('@string("number", 1, 2)') : null,
      'action|1': ['claim', null, 'cancel', 'location'],
    }))
  }
  return list
}
const traceTableList = Mock.mock('/getTableList', 'post', {
  status: 200,
  list: tableList()
})

export default traceTableList
