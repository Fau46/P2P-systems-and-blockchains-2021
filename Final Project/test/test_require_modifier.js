const Mayor = artifacts.require("Mayor");

contract("Testing Mayor (all require and modifier)", accounts =>{
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

  const no_coalition = "0x0000000000000000000000000000000000000000";

  
  var instance;
  var ce1;
  var ce2;
  var ce3;

  it("Test require constuctor 'The candidate cannot be a coalition'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: coalition1,
        coalition_address: coalition2
      }
    ]
    var error;

    try{
      instance = await Mayor.new(candidate_list, escrow, 3)
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "The candidate cannot be a coalition"
    assert.equal(reason, require);
  })

  it("Test require constructor 'The candidate is already registered'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate1,
        coalition_address: coalition2
      }
    ]
    var error;

    try{
      instance = await Mayor.new(candidate_list, escrow, 3)
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "The candidate is already registered"
    assert.equal(reason, require);
  })

})