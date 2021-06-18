import React from 'react';
import { Button, Form, Descriptions } from 'antd';

export default function ElectCandidate(props){

  const mayorOrSayonara = async () =>{
    const result = await props.contract_instance.mayor_or_sayonara({from: props.account})
    var event = result.logs[0].event    
    var addr = event == "NewMayor" ? result.logs[0].args._candidate : result.logs[0].args._escrow
    props.called_mayor_or_sayonara({addr: addr, event: event})
    console.log(event, addr)
  }

    return(
      <Form onFinish={mayorOrSayonara}>
        <Form.Item>
          <Descriptions title={"Mayor or Sayonara"} style={{backgroundColor: "white", width: "500px"}}>
            <Descriptions.Item label="Event">{props.mayor_or_sayonara_event}</Descriptions.Item>
            <Descriptions.Item label="Address">{props.winner_addr}</Descriptions.Item>
          </Descriptions>
        </Form.Item>
        <Form.Item>
        <Button  htmlType="submit" type="primary" shape="round">
          Elect the new candiate
        </Button>
        </Form.Item>
      </Form>
    )
}
