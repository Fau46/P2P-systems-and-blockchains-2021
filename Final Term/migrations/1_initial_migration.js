const Migrations = artifacts.require("Migrations");
const Mayor = artifacts.require("Mayor");


module.exports = async (deployer,newtwork,accounts) => {
  await deployer.deploy(Migrations);

  const candidate = accounts[1];
  const escrow = accounts[9];
  console.log(candidate)
  await deployer.deploy(Mayor, candidate, escrow, 2);
};
