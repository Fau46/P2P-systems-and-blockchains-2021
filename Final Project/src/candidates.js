import React from 'react';
import { Card, Row, Col, Space, Button, Form, InputNumber, Select, notification, Tooltip } from 'antd';
import { UserOutlined, TrophyTwoTone } from '@ant-design/icons';



export default function Candidates(props) {
  const { Option } = Select;
  var candidates = props.state.candidates;
  var contract_instace = props.state.contract_instance
  var component = [];

  const openNotification = placement => {
    notification.success({
      message: `Success`,
      description:
        'Envelope casted',
      placement,
      duration: 5
    });
  };  

  const onFinish = async (values) => {
    var web3 = props.state.web3; 
    var envelope = await contract_instace.compute_envelope(values.sigil, values.candidate, web3.utils.toWei(values.soul.toString(),values.unit));
    await contract_instace.cast_envelope(envelope, {from: props.state.account});
    var forms = document.querySelectorAll(".ant-form")
    forms.forEach(form => form.reset())
    openNotification('topRight');
  };
  
  

  if(candidates){
    const quorum = props.state.quorum;
    const envelopes_casted = props.state.envelopes_casted;
    
    var disabled = quorum > -1 && quorum === envelopes_casted ? true : false;
    
    for(const candidate of candidates){
      var title = candidate === props.state.winner_addr ? <div><TrophyTwoTone twoToneColor="#52c41a" /> {candidate}</div> : candidate

      component.push(
        <Space style={{paddingLeft: "20px"}}>
          <Col className="gutter-row" span={6}>
            <Card key={candidate} cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 350 }}>
              <Card title={<Tooltip placement="topLeft" title={candidate}>{title}</Tooltip>} bordered={false}>
                <Form key={candidate} onFinish={onFinish}>
                  <Form.Item  key={candidate} name="soul" label="Soul" rules={[{required: true, message: 'Please input your soul!',},]}>
                    <InputNumber allowClear disabled={disabled} min={0} max={Math.pow(2,256)-1} style={{width: "202px"}}/>
                  </Form.Item>
                  <Form.Item name="unit" label="Unit" rules={[{required: true, message: 'Please select the unit!',},]}>
                    <Select
                      style={{marginLeft: "11px", width: "194px"}}
                      disabled={disabled}
                    >
                      <Option value="wei">WEI</Option>
                      <Option value="gwei">GWEI</Option>
                      <Option value="ether">ETH</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="sigil" label="Sigil" rules={[{required: true, message: 'Please input your sigil!',},]}>
                    <InputNumber disabled={disabled} min={0} max={Math.pow(2,256)-1} style={{width: "204px"}}/>
                  </Form.Item>
                  <Form.Item name="candidate" initialValue={candidate} style={{height: "0px"}} />
                  <Form.Item>
                    <div style={{marginLeft : "100px", marginTop: "0px"}}><Button htmlType="submit" type="primary" shape="round" disabled={disabled} >VOTE</Button></div>
                  </Form.Item>
                </Form>
              </Card>
            </Card>
          </Col>
        </Space>
      )
    }
  }

  return(
      <Row style={{padding: 50}}gutter={[16, 24]} >
        {component}
      </Row>
  )
}  
