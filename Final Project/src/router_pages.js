
import React from 'react';
import Layout from "./layout_page";
import Web3 from 'web3';
import TruffleContract from '@truffle/contract' 
import Mayor from "./Mayor.json"
import LayoutPage from './layout_page';
import Candidates from "./candidates";



export default class RouterPages extends React.Component{
  constructor(props){
    super(props);
    this.web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    this.contract = TruffleContract(Mayor);
    this.contract.setProvider(this.web3.currentProvider);

    this.state = {
      web3: this.web3,
      contract: this.contract,
      account: '',
      contract_instance: ''
    }
  }

  async componentDidMount(){
    const account = await this.web3.eth.getAccounts();
    const contract_instance = await this.state.contract.deployed();
    const candidates = await contract_instance.get_candidate_addrs.call();
    console.log(account)
    if (window.ethereum) {
      // this.setState({ address: window.ethereum.selectedAddress });
      window.ethereum.on("accountsChanged", accounts => {
        this.setState({ account: accounts[0] });
        console.log(accounts[0])
      });
    }

    this.setState({account: account, contract_instance: contract_instance, candidates: candidates})
  }

  render(){
    return(
      <LayoutPage account={this.state.account}>
        <Candidates state={this.state}/>
      </LayoutPage>
    )
  }
}