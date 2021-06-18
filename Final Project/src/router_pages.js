
import React from 'react';
import Layout from "./layout_page";
import Web3 from 'web3';
import TruffleContract from '@truffle/contract' 
import Mayor from "./Mayor.json"
import LayoutPage from './layout_page';
import Candidates from "./candidates";
import OpenEnvelope from "./open_envelope"
import ElectCandidate from "./elect_candidate"
import { Tabs } from 'antd';

const { TabPane } = Tabs;



export default class RouterPages extends React.Component{
  constructor(props){
    super(props);

    var permission_popup = typeof web3 != undefined;
    this.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    if(permission_popup){
      try{
        window.ethereum.enable();
      }
      catch(error){
        console.log(error)
      }
    }
    this.contract = TruffleContract(Mayor);
    this.contract.setProvider(this.web3.currentProvider);

    this.state = {
      web3: this.web3,
      contract: this.contract,
      account: '',
      contract_instance: null,
      balance: 0,
      quorum: -1,
      envelopes_casted: -1,
      envelopes_opened: -1,
      winner_addr: '-',
      mayor_or_sayonara_event: '-',
      called_mayor_or_sayonara: this.called_mayor_or_sayonara.bind(this)
    }
  }

  called_mayor_or_sayonara(event, addr_winner){
    this.setState({winner_addr: addr_winner, mayor_or_sayonara_event: event})
  }

  async updateBalance(){
    if(this.state.account){
      const balance = await this.web3.eth.getBalance(this.state.account);
      this.setState({balance: balance})
    }
  }

  async updateVotingCondition(){
    if(this.state.contract_instance){
      const voting_condition = await this.state.contract_instance.get_voting_condition();
      this.setState({quorum: voting_condition[0].words[0], envelopes_casted: voting_condition[1].words[0], envelopes_opened: voting_condition[2].words[0]})
    }

  }

  show_mayor_or_sayonara(){
    if(this.state.quorum>0 && this.state.quorum == this.state.envelopes_opened){
      return (
        <TabPane tab="Mayor or Sayonara" key="4">
          <ElectCandidate 
            account={this.state.account}
            contract_instance={this.state.contract_instance} 
            winner_addr={this.state.winner_addr} 
            mayor_or_sayonara_event={this.state.mayor_or_sayonara_event} 
            called_mayor_or_sayonara={this.state.called_mayor_or_sayonara}
          />
        </TabPane>)
    }
    return null
  }

  async componentDidMount(){
    const account = (await this.web3.eth.getAccounts())[0];
    const contract_instance = await this.state.contract.deployed();
    const candidates = await contract_instance.get_candidate_addrs.call();
    const balance = await this.web3.eth.getBalance(account);
    
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        const balance = await this.web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance: balance});
      });
    }

    this.interval_update_balance = setInterval(() => this.updateBalance(), 150)
    this.interval_update_voting_condition = setInterval(() => this.updateVotingCondition(), 1000);
    
    this.setState({account: account, contract_instance: contract_instance, candidates: candidates, balance: balance})
  }

  componentWillUnmount() {
    clearInterval(this.interval_update_balance);
    clearInterval(this.interval_update_voting_condition)
  }

  render(){
    return(
        <LayoutPage account={this.state.account} balance={this.state.balance} quorum={this.state.quorum} envelopes_casted={this.state.envelopes_casted} envelopes_opened={this.state.envelopes_opened}>
          <Tabs defaultActiveKey="1" centered>
            <TabPane tab="Candidates" key="1">
              <Candidates state={this.state}/>
            </TabPane>
            <TabPane tab="Coalitions" key="2">
              <Candidates state={this.state}/>
            </TabPane>
            <TabPane tab="Open Envelope" key="3">
              <OpenEnvelope state={this.state}/>
            </TabPane>
            {
              this.show_mayor_or_sayonara()
            }
          </Tabs>
        </LayoutPage>
    )
  }
}