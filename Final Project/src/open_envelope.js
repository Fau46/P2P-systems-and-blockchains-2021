import React from 'react';
import { Card, Row, Col, Space, Button, Form, InputNumber, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';



export default function OpenEnvelope(props) {
  
  var candidates = props.state.candidates;
  var contract_instace = props.state.contract_instance
  var component = [];
  
  const success = () => {message.info('Envelope opened');}

  const onFinish = async (values) => {
    var envelope = await contract_instace.open_envelope(values.sigil, values.candidate, {from: props.state.account, value: values.soul})
    console.log(envelope)
    success()

  };

  if(candidates){
    for(const candidate of candidates){
      component.push(
        <Space style={{paddingLeft: "20px"}}>
          <Col className="gutter-row" span={6}>
            <Card key="{candidate}" cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 350 }}>
              <Card title={candidate} bordered={false}>
                <Form onFinish={onFinish}>
                  <Form.Item name="soul" label="Soul" rules={[{required: true, message: 'Please input your soul!',},]}>
                  <InputNumber min={0} max={Math.pow(2,256)-1} style={{width: "202px"}}/>
                  </Form.Item>
                  <Form.Item name="sigil" label="Sigil" rules={[{required: true, message: 'Please input your sigil!',},]}>
                    <InputNumber min={0} max={Math.pow(2,256)-1} style={{width: "204px"}}/>
                  </Form.Item>
                  <Form.Item name="candidate" initialValue={candidate} style={{height: "0px"}} />
                  <Form.Item>
                    <div style={{marginLeft : "63px"}}><Button htmlType="submit" type="primary" shape="round">OPEN ENVELOPE</Button></div>
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
