import React from 'react';
import { Card, Row, Col, Space, Button, Form, InputNumber, Select, Collapse, List, notification } from 'antd';
import { UserOutlined } from '@ant-design/icons';



export default function OpenEnvelope(props) {
  const { Option } = Select;
  const { Panel } = Collapse;
  var candidates = props.state.candidates;
  var coalitions = props.state.coalitions;
  var contract_instace = props.state.contract_instance
  var component = [];

  const openNotification = placement => {
    notification.success({
      message: `Success`,
      description:
        'Envelope opened',
      placement,
      duration: 5
    });
  };  

  const onFinish = async (values) => {
    var web3 = props.state.web3; 
    await contract_instace.open_envelope(values.sigil, values.candidate, {from: props.state.account, value: web3.utils.toWei(values.soul.toString(),values.unit)});
    var forms = document.querySelectorAll(".ant-form")
    forms.forEach(form => form.reset())
    openNotification('topRight');

  };

  if(candidates){
    const quorum = props.state.quorum;
    const envelopes_casted = props.state.envelopes_casted;
    const envelopes_opened = props.state.envelopes_opened
    
    var disabled = quorum !== -1 && quorum === envelopes_casted && quorum !== envelopes_opened ? false : true;

    for(const candidate of candidates){
      component.push(
        <Space style={{paddingLeft: "20px"}}>
          <Col className="gutter-row" span={6}>
            <Card key="{candidate}" cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 350 }}>
              <Card title={candidate} bordered={false}>
                <Form  onFinish={onFinish}>
                  <Form.Item name="soul" label="Soul" rules={[{required: true, message: 'Please input your soul!',},]}>
                    <InputNumber disabled={disabled} min={0} max={Math.pow(2,256)-1} style={{width: "202px"}}/>
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
                    <div style={{marginLeft : "63px"}}><Button htmlType="submit" type="primary" shape="round" disabled={disabled}>OPEN ENVELOPE</Button></div>
                  </Form.Item>
                </Form>
              </Card>
            </Card>
          </Col>
        </Space>
      )
    }

    for(const coalition of coalitions){
      component.push(
        <Space style={{paddingLeft: "20px"}}>
          <Col className="gutter-row" span={6}>
            <Card key={coalition.addr} cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 350 }}>
              <Card title={coalition.addr} bordered={false}>
                <Collapse style={{marginBottom: "25px"}}>
                  <Panel header="Members">
                    <List
                      size="small"
                      dataSource={coalition.members}
                      renderItem={item => <List.Item style={{overflow: "hidden"}}>{item}</List.Item>}
                    />
                  </Panel>
                </Collapse>
                <Form id="form" onFinish={onFinish}>
                  <Form.Item name="soul" label="Soul" rules={[{required: true, message: 'Please input your soul!',},]}>
                    <InputNumber disabled={disabled} min={0} max={Math.pow(2,256)-1} style={{width: "202px"}}/>
                  </Form.Item>
                  <Form.Item name="unit" label="Unit" rules={[{required: true, message: 'Please select the unit!',},]}>
                    <Select
                      style={{marginLeft: "11px", width: "190px"}}
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
                  <Form.Item name="candidate" initialValue={coalition.addr} style={{height: "0px"}} />
                  <Form.Item>
                    <div style={{marginLeft : "63px"}}><Button htmlType="submit" type="primary" shape="round" disabled={disabled} >OPEN ENVELOPE</Button></div>
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
