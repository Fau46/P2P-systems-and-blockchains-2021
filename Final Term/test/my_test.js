const Mayor = artifacts.require("Mayor");
const web3 = require("web3")


contract("Testing Mayor", accounts => {
  const deployer = accounts[0];
  const candidate = accounts[1];
  const escrow = accounts[9];

  const voter_1 = accounts[2];
  const voter_2 = accounts[3];

  // const eth = web3.utils.toBN(1000000000000000000);
  const eth = 1;
  var instance;
  var ce1;
  var ce2;

  it("Should test constructor", async function() {
    instance = await Mayor.new(candidate, escrow, 2, {from: deployer});
    // instance = await Mayor.new.estimateGas(candidate, escrow, 2, {from: deployer});
    // console.log("Estimate gas " + instance);
  });
  

  it("Should test compute_envelope", async function(){
    // ce1 = await instance.compute_envelope.estimateGas(1,true, web3.utils.toWei("50", "ether"), {from: voter_1});
    ce1 = await instance.compute_envelope(1,true, web3.utils.toWei("50", "ether"), {from: voter_1});
    ce2 = await instance.compute_envelope(1,false, web3.utils.toWei("1", "ether"), {from: voter_2});
    // console.log(ce1);
  })

  it("Should test cast_envelope", async function(){
    // const result = await instance.cast_envelope.estimateGas(ce1, {from: voter_1});
    await instance.cast_envelope(ce1, {from: voter_1});
    await instance.cast_envelope(ce2,{from: voter_2});
    // console.log(result);
  })

  it("Should test open_envelope", async function(){
    // const result = await instance.open_envelope.estimateGas(1,true, {from: voter_1, value: web3.utils.toWei("50", "ether")})
    await instance.open_envelope(1,true, {from: voter_1, value: web3.utils.toWei("50", "ether")})
    await instance.open_envelope(1,false, {from: voter_2, value: web3.utils.toWei("1", "ether")})
    // console.log(result)
  })

  it("Should test mayor_or_sayonara", async function(){
    const result = await instance.mayor_or_sayonara.estimateGas({from: deployer});
    // const result = await instance.mayor_or_sayonara({from: deployer});
    console.log(result)
  })
  
 });