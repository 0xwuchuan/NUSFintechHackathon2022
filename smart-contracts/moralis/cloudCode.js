require("dotenv").config();
const privateKey = process.env.PRIVATEKEY;

const logger = Moralis.Cloud.getLogger();

const web3Main = Moralis.web3ByChain("0x4"); // Rinkeby Testnet
const web3Side = Moralis.web3ByChain("0x13881"); // Mumbai Testnet

const MainBridge_address = "0xA30C6c269782D116C3a40B29c010099f79a52d0D";
const SideBridge_address = "0x428cfE4C32BC9421038E34dD5193ac63Bf8057F5";
const mainToken_address = "0xEC124D9860ffe553Bd5158Ba11687F414dd37529";
const childToken_address = "0x677Ad9aE8E9F311e204869a3c36F3a529746Aa09";
const gateway_address = "0x568599bD57BaB2f3Ab083009a99f18Ed57D9DF0c";
const gatewayKey = privateKey;
const MainBridge_abi =
  '[{"inputs":[{"internalType":"address","name":"_mainNFT","type":"address"},{"internalType":"address","name":"_gateway","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"NFTLocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"NFTUnlocked","type":"event"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"lockNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"unlockNFT","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
const SideBridge_abi = "asdf";
const MainBridge = new web3Main.eth.Contract(
  JSON.parse(MainBridge_abi),
  MainBridge_address
);
const SideBridge = new web3Side.eth.Contract(
  JSON.parse(SideBridge_abi),
  SideBridge_address
);

Moralis.Cloud.afterSave("EthNFTTransfers", (request) => {
  const data = JSON.parse(
    JSON.stringify(request.object, [
      "token_address",
      "to_address",
      "from_address",
      "transaction_hash",
      "token_id",
      "confirmed",
    ])
  );
  logger.info(data);
  if (
    data["token_address"] == mainToken_address.toLocaleLowerCase() &&
    data["to_address"] == MainBridge_address.toLocaleLowerCase() &&
    !data["confirmed"]
  ) {
    const txlock = processBridgeRequestLock(data);
    const txbridge = processBridgeRequestBridge(data);
  } else {
    logger.info("transaction not related to bridge");
  }
  async function processBridgeRequestLock(data) {
    logger.info("bridging starting locking tokens");
    const functionCall = MainBridge.methods
      .lockNFT(data["from_address"], data["token_id"])
      .encodeABI();
    const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
    const transactionBody = {
      to: MainBridge_address,
      nonce: gatewayNonce,
      data: functionCall,
      gas: 400000,
      gasPrice: web3Main.utils.toWei("2", "gwei"),
    };
    signedTransaction = await web3Main.eth.accounts.signTransaction(
      transactionBody,
      gatewayKey
    );
    logger.info(signedTransaction.transactionHash);
    fulfillTx = await web3Main.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
  }
  async function processBridgeRequestBridge(data) {
    logger.info("bridging tokens");
    const functionCall = SideBridge.methods
      .bridgeNFT(data["from_address"], data["token_id"])
      .encodeABI();
    const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
    const transactionBody = {
      to: SideBridge_address,
      nonce: gatewayNonce,
      data: functionCall,
      gas: 400000,
      gasPrice: web3Side.utils.toWei("2", "gwei"),
    };
    signedTransaction = await web3Side.eth.accounts.signTransaction(
      transactionBody,
      gatewayKey
    );
    logger.info(signedTransaction.transactionHash);
    fulfillTx = await web3Side.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    return fulfillTx;
  }
});

Moralis.Cloud.afterSave("PolygonNFTTransfers", (request) => {
  const data = JSON.parse(
    JSON.stringify(request.object, [
      "token_address",
      "to_address",
      "from_address",
      "transaction_hash",
      "token_id",
      "confirmed",
    ])
  );
  logger.info(data);
  if (
    data["token_address"] == childToken_address.toLocaleLowerCase() &&
    data["to_address"] == SideBridge_address.toLocaleLowerCase() &&
    !data["confirmed"]
  ) {
    const txlock = processReturnBurn(data);
    const txbridge = processReturnUnlock(data);
  } else {
    logger.info("transaction not related to bridge");
  }
  async function processReturnBurn(data) {
    logger.info("returning tokens burning");
    const functionCall = SideBridge.methods
      .returnNFT(data["from_address"], data["value"])
      .encodeABI();
    const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
    const transactionBody = {
      to: SideBridge_address,
      nonce: gatewayNonce,
      data: functionCall,
      gas: 400000,
      gasPrice: web3Side.utils.toWei("2", "gwei"),
    };
    signedTransaction = await web3Side.eth.accounts.signTransaction(
      transactionBody,
      gatewayKey
    );
    logger.info(signedTransaction.transactionHash);
    fulfillTx = await web3Side.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    return fulfillTx;
  }
  async function processReturnUnlock(data) {
    logger.info("returning starting unlocking tokens");
    const functionCall = MainBridge.methods
      .unlockNFT(data["from_address"], data["value"])
      .encodeABI();
    const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
    const transactionBody = {
      to: MainBridge_address,
      nonce: gatewayNonce,
      data: functionCall,
      gas: 400000,
      gasPrice: web3Main.utils.toWei("2", "gwei"),
    };
    signedTransaction = await web3Main.eth.accounts.signTransaction(
      transactionBody,
      gatewayKey
    );
    logger.info(signedTransaction.transactionHash);
    fulfillTx = await web3Main.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );
    logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
  }
});
