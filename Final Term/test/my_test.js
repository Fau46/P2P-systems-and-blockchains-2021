const Mayor = artifacts.require("Mayor");
var web3 = require("web3")

contract("Testing Mayor", accounts => {
  const deployer = accounts[0];
  const candidate = accounts[1];
  const escrow = accounts[9];

  const voter_1 = accounts[2];
  const voter_2 = accounts[3];

  // const eth = web3.utils.toBN(1000000000000000000);
  const eth = 1;

  it("Should test the voter phase", async function() {
    const instance = await Mayor.new(candidate, escrow, 2, {from: deployer});
    const ce1 = await instance.compute_envelope(1,true, eth, {from: voter_1});
    await instance.cast_envelope(ce1, {from: voter_1});
    const ce2 = await instance.compute_envelope(1,false, eth * 10, {from: voter_2});
    await instance.cast_envelope(ce1, {from: voter_1});
    await instance.cast_envelope(ce2,{from: voter_2});
    await instance.open_envelope(1,true, {from: voter_1, value: eth})
    await instance.open_envelope(1,false, {from: voter_2, value: eth * 10})
    const result = await instance.mayor_or_sayonara({from: deployer});

    console.log(result)
    assert(instance.yaySoul, 0, "errore");
  }); 
 });