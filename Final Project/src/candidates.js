import React from 'react';
import { Card } from 'antd';

export default function Candidates(props) {
  var candidates = props.state.candidates;
  // async function get_candidates(){ 
  //   if(props.state.contract_instance){
  //     candidates = await props.state.contract_instance.get_candidate_addrs.call();
  //   }
  // }
  // console.log(candidates)

  // get_candidates()
  var component = [];
  if(candidates){
    for(const candidate of candidates){
      component.push(<Card title={candidate} bordered={false} style={{ width: 300 }}></Card>)
    }
  }

  return(
    <div>{component}</div>
  )
}  
