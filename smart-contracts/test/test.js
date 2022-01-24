const { assert } = require("chai");
const truffleAssert = require("truffle-assertions");
const FakeApes = artifacts.require("FakeApes");

contract("FakeApes", (accounts) => {
  let contract;
  let baseURI =
    "ipfs://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi/";

  before(async () => {
    contract = await FakeApes.deployed(baseURI);
  });

  describe("deployment", async () => {
    // Test Case 1 : Contract can be deployed successfully
    it("contract deployed successfully", async () => {
      const address = contract.address;
      // console.log(address);
      assert.notEqual(address, "");
      assert.notEqual(address, 0x0);
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    // Test Case 2 : Should return correct name and symbol
    it("has a name and symbol", async () => {
      const name = await contract.name();
      const symbol = await contract.symbol();
      assert.equal(name, "Fake Apes");
      assert.equal(symbol, "FAPE");
    });
  });

  describe("minting", async () => {
    it("creates a new token and transfer event emitted");
  });
});
