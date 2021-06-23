const Migrations = artifacts.require("Migrations");
const Mayor = artifacts.require("Mayor");

module.exports = async function (deployer, newtwork, accounts) {
  await deployer.deploy(Migrations);

  const depl = accounts[0];
  const candidate1 = accounts[1];
  const coalition1 = accounts[2];
  const candidate2 = accounts[3];
  const coalition2 = accounts[4];
  const candidate3 = accounts[5];
  const candidate4 = accounts[6];
  const escrow = accounts[7];
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

  const instance = await deployer.deploy(Mayor, candidate_list, escrow, 3);
  // const ce1 = await instance.compute_envelope(1,candidate1, 1, {from: candidate1});
  // await instance.cast_envelope(ce1, {from: candidate1});
  // const ce2 = await instance.compute_envelope(1,candidate2, 1, {from: candidate2});
  // await instance.cast_envelope(ce2, {from: candidate2});
  // await instance.open_envelope(1,candidate2, {from: candidate2, value: 1})
  // await instance.open_envelope(1,candidate1, {from: candidate1, value: 1})
};