const Mayor = artifacts.require("Mayor");
const web3 = require("web3")


contract("Testing Mayor", accounts => {
  const quorum = 100
  const deployer = accounts[quorum];
  const candidate = accounts[quorum+1];
  const escrow = accounts[quorum+2];


  var instance;
  var yayVoters = 50;
  var nayVoters = 50;
  var yayVotersArray = new Array();
  var nayVotersArray = new Array();

  it("Should test constructor", async function() {
    instance = await Mayor.new(candidate, escrow, quorum, {from: deployer});
  });
  

  it("Should test compute_envelope", async function(){
    for(i = 0; i < yayVoters; i++){
      yayVotersArray[i] = await instance.compute_envelope(1,true, web3.utils.toWei("50", "ether"), {from: accounts[i]});
    }

    for(i = 0; i < nayVoters; i++){
      nayVotersArray[i] = await instance.compute_envelope(1,false, web3.utils.toWei("50", "ether"), {from: accounts[yayVoters+i]});
    }
  })

  it("Should test cast_envelope", async function(){
    for(i = 0; i < yayVoters; i++){
      await instance.cast_envelope(yayVotersArray[i], {from: accounts[i]});
    }
    for(i = 0; i < nayVoters; i++){
      await instance.cast_envelope(nayVotersArray[i],{from: accounts[yayVoters+i]});
    }
  })

  it("Should test open_envelope", async function(){
    for(i = 0; i < yayVoters; i++){
      await instance.open_envelope(1,true, {from: accounts[i], value: web3.utils.toWei("50", "ether")})
    }
    for(i = 0; i < nayVoters; i++){
      await instance.open_envelope(1,false, {from: accounts[yayVoters+i], value: web3.utils.toWei("50", "ether")})
    }
  })

  it("Should test mayor_or_sayonara", async function(){
    // const result = await instance.mayor_or_sayonara.estimateGas({from: deployer, gas: 50000000000});
    console.log(result)
  })
  
 });