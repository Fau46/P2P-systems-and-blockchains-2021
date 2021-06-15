const Mayor = artifacts.require("Mayor");

contract("Testing Mayor", accounts =>{
  const deployer = accounts[0];
  const candidate = accounts[1];
  const coalition = accounts[2];
  const escrow = accounts[3];

  it("Should test constructor", async function(){
    dict = {
      candidate_address: candidate,
      coalition_address: coalition
    }

    instance = await Mayor.new([dict], escrow, 1)
    console.log(instance)
  })
})