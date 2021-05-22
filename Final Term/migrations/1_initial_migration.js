const Migrations = artifacts.require("Migrations");
const Mayor = artifacts.require("Mayor");


module.exports = async (deployer,newtwork,accounts) => {
  await deployer.deploy(Migrations);

  // const candidate = accounts[1];
  // const escrow = accounts[9];

  // const voter_1 = accounts[2];
  // const voter_2 = accounts[3];

  // const instance = await deployer.deploy(Mayor, candidate, escrow, 2);
  // const ce1 = await instance.compute_envelope(1,false, web3.utils.toWei("50", "ether"), {from: voter_1});
  // await instance.cast_envelope(ce1, {from: voter_1});
  // console.log("voter 1 voted");
  // const ce2 = await instance.compute_envelope(1,true, web3.utils.toWei("1", "ether"), {from: voter_2});
  // await instance.cast_envelope(ce2,{from: voter_2});
  // console.log("voter 2 voted");
  // await instance.open_envelope(1,false, {from: voter_1, value: web3.utils.toWei("50", "ether")})
  // await instance.open_envelope(1,true, {from: voter_2, value: web3.utils.toWei("1", "ether")})
  // console.log("envelope opened");
  // await instance.mayor_or_sayonara();
  // console.log("mayor elected")
};
