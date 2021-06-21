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

  it("Test require constuctor 'The coalition cannot be a candidate'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: candidate1
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
    const require = "The coalition cannot be a candidate"
    assert.equal(reason, require);
  })

  it("Test modifier canVote cast_envelope 'Cannot vote now, voting quorum has been reached'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 1)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    await instance.open_envelope(1, coalition1, {from: voter1, value: 1})

    ce2 = await instance.compute_envelope(2, coalition2, 1, {from: voter2});
    try{
      await instance.cast_envelope(ce2, {from: voter2})
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "Cannot vote now, voting quorum has been reached"
    assert.equal(reason, require);
  })

  it("Test require open_envelope 'The sender has not casted any vote'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 1)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    
    try{
      await instance.open_envelope(2, coalition2, {from: voter2, value: 1})
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "The sender has not casted any vote"
    assert.equal(reason, require);
  })

  it("Test require open_envelope 'Envelope already opened'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 1)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    await instance.open_envelope(1, coalition1, {from: voter1, value: 1})
    

    try{
      await instance.open_envelope(1, coalition1, {from: voter1, value: 1})
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "Envelope already opened"
    assert.equal(reason, require);
  })

  it("Test require open_envelope 'Sent envelope does not correspond to the one casted'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 1)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    

    try{
      await instance.open_envelope(2, coalition1, {from: voter1, value: 1})
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "Sent envelope does not correspond to the one casted"
    assert.equal(reason, require);
  })

  it("Test require canOpen open_envelope 'Cannot open an envelope, voting quorum not reached yet'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 2)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    

    try{
      await instance.open_envelope(1, coalition1, {from: voter1, value: 1})
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "Cannot open an envelope, voting quorum not reached yet"
    assert.equal(reason, require);
  })

  it("Test require mayor_or_sayonara 'The elections are over'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 1)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    await instance.open_envelope(1, coalition1, {from: voter1, value: 1})    
    await instance.mayor_or_sayonara();

    try{
      await instance.mayor_or_sayonara();
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "The elections are over"
    assert.equal(reason, require);
  })

  it("Test modifier canCheckOutcome mayor_or_sayonara 'Cannot check the winner, need to open all the sent envelopes'", async function(){
    const candidate_list = [
      {
        candidate_address: candidate1,
        coalition_address: coalition1
      },
      {
        candidate_address: candidate2,
        coalition_address: coalition2
      }
    ]
    var error;

    instance = await Mayor.new(candidate_list, escrow, 2)
    ce1 = await instance.compute_envelope(1, coalition1, 1, {from: voter1});
    await instance.cast_envelope(ce1, {from: voter1})
    
    ce2 = await instance.compute_envelope(2, coalition2, 1, {from: voter2});
    await instance.cast_envelope(ce2, {from: voter2})
    
    await instance.open_envelope(1, coalition1, {from: voter1, value: 1})    
    
    try{
      await instance.mayor_or_sayonara();
    }catch(err){
      error = err
    } 

    var first_key = Object.keys(error.data)[0];
    const reason = error.data[first_key].reason;
    const require = "Cannot check the winner, need to open all the sent envelopes"
    assert.equal(reason, require);
  })

})