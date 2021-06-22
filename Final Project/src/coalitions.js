import React from 'react';
import { Card, Row, Col, Space, Button, Form, InputNumber, notification, Select, Collapse, List, Tooltip} from 'antd';
import { UserOutlined, TrophyTwoTone } from '@ant-design/icons';



export default function Coalitions(props) {
  const { Option } = Select;
  const { Panel } = Collapse;
  var coalitions = props.state.coalitions;
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
    var envelope = await contract_instace.compute_envelope(values.sigil, values.coalition, web3.utils.toWei(values.soul.toString(),values.unit));
    await contract_instace.cast_envelope(envelope, {from: props.state.account});
    var forms = document.querySelectorAll(".ant-form")
    forms.forEach(form => form.reset())
    openNotification('topRight');
  };

  if(coalitions){
    const quorum = props.state.quorum;
    const envelopes_casted = props.state.envelopes_casted;
    
    var disabled = quorum > -1 && quorum === envelopes_casted ? true : false;

    for(const coalition of coalitions){
      var title = coalition.addr === props.state.winner_addr ? <div style={{overflow: "hidden", textOverflow: "ellipsis"}}><TrophyTwoTone twoToneColor="#52c41a" /> {coalition.addr}</div> : coalition.addr


      component.push(
        <Space style={{paddingLeft: "20px"}}>
          <Col className="gutter-row" span={6}>
            <Card key={coalition.addr} cover={<UserOutlined style={{ fontSize: '160px', padding: "10px"}}/>} bordered={false} style={{ width: 350 }}>
              <Card title={<Tooltip placement="topLeft" title={coalition.addr}>{title}</Tooltip>} bordered={false}>
                <Collapse style={{marginBottom: "25px"}}>
                  <Panel header="Members">
                    <List
                      size="small"
                      dataSource={coalition.members}
                      renderItem={
                        item => 
                          <List.Item>
                            <Tooltip placement="top" title={item}>
                              <div style={{overflow: "hidden", textOverflow: "ellipsis"}}>{item}</div>
                            </Tooltip>  
                          </List.Item>}
                    />
                  </Panel>
                </Collapse>
                <Form onFinish={onFinish}>
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
                  <Form.Item name="coalition" initialValue={coalition.addr} style={{height: "0px"}} />
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
