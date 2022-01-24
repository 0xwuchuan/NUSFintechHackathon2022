/* eslint-disable no-undef */
const MainBridge = artifacts.require("MainBridge");
const SideBridge = artifacts.require("SideBridge");
const NFTContract = artifacts.require("FakeApes");
const childNFTContract = artifacts.require("NFTChild");

module.exports = async function (deployer) {
  await deployer.deploy(NFTContract);
  const mainNFT = await NFTContract.deployed();
  await deployer.deploy(
    MainBridge,
    mainNFT.address,
    "0x568599bd57bab2f3ab083009a99f18ed57d9df0c"
  );
  await deployer.deploy(
    SideBridge,
    "0x568599bd57bab2f3ab083009a99f18ed57d9df0c"
  );
  const sideBridge = await SideBridge.deployed();
  const child = await deployer.deploy(childNFTContract, sideBridge.address);
  await sideBridge.initializeBridge(child.address);
};
