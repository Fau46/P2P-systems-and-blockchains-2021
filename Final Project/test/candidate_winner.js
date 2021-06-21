const Mayor = artifacts.require("Mayor");

contract("Testing Mayor (candidate winner)", accounts =>{
  const deployer = accounts[0];
  const candidate1 = accounts[1];
  const coalition1 = accounts[2];
  const candidate2 = accounts[3];
  const coalition2 = accounts[4];
  const candidate3 = accounts[5];
  const candidate4 = accounts[6];
  const escrow = accounts[7];

  const voter1 = accounts[8];
  const voter2 = accounts[9];
  const voter3 = accounts[10];

  // console.log("candidate1: "+candidate1)
  // console.log("candidate2: "+candidate2)
  // console.log("candidate3: "+candidate3)
  // console.log("candidate4: "+candidate4)
  // console.log()
  // console.log("coalition1: "+coalition1)
  // console.log("coalition2: "+coalition2)
  // console.log() 
  // console.log("escrow: "+escrow)
  // console.log()
  // console.log("voter1: "+voter1)
  // console.log("voter2: "+voter2)
  // console.log("voter3: "+voter3)


  const no_coalition = "0x0000000000000000000000000000000000000000";

  const candidate_list = [
    {
      candidate_address: candidate1,
      coalition_address: coalition1
    },
    {
      candidate_address: candidate2,
      coalition_address: coalition2
    },
    {
      candidate_address: candidate3,
      coalition_address: coalition2
    },
    {
      candidate_address: candidate4,
      coalition_address: no_coalition
    }
  ]
  var instance;
  var ce1;
  var ce2;
  var ce3;
  var ce4; 

  it("Should test constructor", async function(){
    instance = await Mayor.new(candidate_list, escrow, 3)
  })

  it("Should test compute_envelope", async function(){
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    ce2 = await instance.compute_envelope(2, coalition2, 1, {from: voter2});
    ce3 = await instance.compute_envelope(3, candidate4, 1, {from: voter3});
    ce4 = await instance.compute_envelope(1, coalition2, 1, {from: voter1});
  })
  
  it("Should test cast_envelope", async function(){
    await instance.cast_envelope(ce4, {from: voter1}) 
    await instance.cast_envelope(ce1, {from: voter1}) //test the change of the vote
    await instance.cast_envelope(ce2, {from: voter2})
    await instance.cast_envelope(ce3, {from: voter3})
  })

  it("Should test open_envelope", async function(){
    await instance.open_envelope(1, coalition1, {from: voter1, value: 1})
    await instance.open_envelope(2, coalition2, {from: voter2, value: 1})
    await instance.open_envelope(3, candidate4, {from: voter3, value: 1})
  })

  it("Should test mayor_or_sayonara", async function(){
    const out = await instance.mayor_or_sayonara();
    assert.equal(out.logs[0].args._candidate, candidate4);
  })
})