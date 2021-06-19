import React from 'react';
import { Button, Form, Descriptions, Card, Row, Col } from 'antd';

export default function ElectCandidate(props){

  const mayorOrSayonara = async () =>{
    await props.contract_instance.mayor_or_sayonara({from: props.account})
    props.called_mayor_or_sayonara()
  }

  return(
    <Row justify="space-around" align="middle">
      <Col >
        <Card style={{width: "500px", margin: "20px"}}>
          <Form onFinish={mayorOrSayonara}>
            <Form.Item>
              <Descriptions title={"Mayor or Sayonara"} style={{backgroundColor: "white"}}>
                <Descriptions.Item label="Event">{props.mayor_or_sayonara_event}</Descriptions.Item>
                <Descriptions.Item label="Address">{props.winner_addr}</Descriptions.Item>
              </Descriptions>
            </Form.Item>
            <Form.Item>
            <Button  htmlType="submit" type="primary" shape="round" disabled={props.elections_over} style={{marginLeft: "140px"}}>
              Elect the new candiate
            </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}
