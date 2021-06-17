import React, { Component } from 'react'
import Web3 from 'web3'
import TruffleContract from '@truffle/contract' 
import Mayor from "./Mayor.json"
import { Button } from 'antd';

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts();
    
    this.contract = TruffleContract(Mayor);
    this.contract.setProvider(web3.currentProvider);
    
    const contract_instace = await this.contract.deployed();

    // $.getJSON("Mayor.json").done(async function(c){
    //   App.contracts["Mayor"] = TruffleContract(c);
    //   App.contracts["Mayor"].setProvider(App.web3Provider);
      
    //   App.instance = await App.contracts["Mayor"].deployed();
    //   return App.render()
    // })
    var test = await contract_instace.get_candidate_addrs.call()
    console.log(test)
    this.setState({ account: accounts[0], instance: test })
  }

  constructor(props) {
    super(props)
    this.state = { 
      account: '',
      instance:  '',
   }
  }

  render() {
    var accounts = []
    for(const elem of this.state.instance){
      accounts.push(<p>{elem}</p>)
    }
    return (
      <>
        <div className="container">
          <h1>Hello, World! </h1>
          <p>Your account: {this.state.account}</p>
          <p>Contract: {accounts}</p>  
        </div>
        <Button type="primary">Primary Button</Button>
      </>
    );
  }
}

export default App;