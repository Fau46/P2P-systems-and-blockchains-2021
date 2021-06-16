// const { default: Web3 } = require("web3");
App = {
  contracts: {},
  web3Provider: null,
  url: 'http://localhost:8545',
  account: '0x0',
  instance: null,

  init: function(){
    return App.initWeb3();
  },
  initWeb3: function(){
    if(typeof web3 != 'undefined'){
      App.web3Provider = window.ethereum;
      web3 = new Web3(App.web3Provider);

      try{
        ethereum.enable().then(async() => {console.log("DApp connected"); });
      }catch(error){
        console.log(error);
      }
    }
    else{
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },
  initContract: function(){
    web3.eth.getCoinbase(function(err, account){
      if(err == null){
        App.account = account;
        console.log(account);
      }
    })

    $.getJSON("Mayor.json").done(async function(c){
      App.contracts["Mayor"] = TruffleContract(c);
      App.contracts["Mayor"].setProvider(App.web3Provider);
      
      App.instance = await App.contracts["Mayor"].deployed();
      return App.render()
    })

  },
  render: function(){
    console.log(App.instance)
  }

}

$(function() {
  $(window).on('load', function () {
      App.init();
  });
});