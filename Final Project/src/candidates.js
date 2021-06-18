import React from 'react';
import { Card, Row, Col, Space, Input, Select, Button, Form, InputNumber } from 'antd';
import { UserOutlined } from '@ant-design/icons';



export default function Candidates(props) {
  const { Option } = Select;
  var candidates = props.state.candidates;
  var component = [];

  // const Demo = () => {
    const onFinish = (values) => {
      console.log('Success:', isNaN(values.sigil));
    };
  
  // }
  
  

  if(candidates){
    for(const candidate of candidates){
      component.push(
        <Space style={{padding: "15px"}}>
          <Col className="gutter-row" span={6}>
            <Card key="{candidate}" cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 300 }}>
              <Card title={candidate} bordered={false}>
              <Form onFinish={onFinish}>
                <Form.Item name="souls" label="Souls" rules={[{required: true, message: 'Please input your souls!',},]}>
                  <Input style={{paddingBottom: "10px"}}/>
                </Form.Item>
                <Form.Item name="sigil" label="Sigil" rules={[{required: true, message: 'Please input your souls!',},]}>
                  <InputNumber style={{paddingBottom: "10px"}}/>
                </Form.Item>
                <Form.Item>
                  <div style={{marginLeft : "65px", marginTop: "10px"}}><Button htmlType="submit" type="primary" shape="round">VOTE</Button></div>
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
    // <Space align="center" size="large">
      <Row style={{padding: 50}}gutter={[16, 24]} >
        {component}
      </Row>
    // </Space>
  )
}  
