
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
      contract_instance: '',
      balance: 0
    }
  }

  async updateBalance(){
    if(this.state.account){
      const balance = await this.web3.eth.getBalance(this.state.account);
      this.setState({balance: balance})
    }
  }

  async componentDidMount(){
    const account = (await this.web3.eth.getAccounts())[0];
    const contract_instance = await this.state.contract.deployed();
    const candidates = await contract_instance.get_candidate_addrs.call();
    const balance = await this.web3.eth.getBalance(account);
    if (window.ethereum) {
      // this.setState({ address: window.ethereum.selectedAddress });
      window.ethereum.on("accountsChanged", async (accounts) => {
        const balance = await this.web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance: balance});
      });
    }

    this.interval = setInterval(() => this.updateBalance(), 150)

    this.setState({account: account, contract_instance: contract_instance, candidates: candidates, balance: balance})
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render(){
    return(
      <LayoutPage account={this.state.account} balance={this.state.balance}>
        <Candidates state={this.state}/>
      </LayoutPage>
    )
  }
}