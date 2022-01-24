import React, { useState } from "react";
import { useMoralis, useNFTBalances } from "react-moralis";
import { Card, Image, Tooltip, Modal, Input, Skeleton } from "antd";
import {
  FileSearchOutlined,
  SendOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import AddressInput from "./AddressInput";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";

const { Meta } = Card;

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function NFTBalance() {
  const { data: NFTBalances } = useNFTBalances();
  const { Moralis, chainId } = useMoralis();
  const [visible, setVisibility] = useState(false);
  const [receiverToSend, setReceiver] = useState(null);
  const [amountToSend, setAmount] = useState(null);
  const [nftToSend, setNftToSend] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { verifyMetadata } = useVerifyMetadata();

  async function transfer(nft, amount, receiver) {
    console.log(nft, amount, receiver);
    const options = {
      type: "erc721",
      tokenId: nft?.token_id,
      receiver,
      contractAddress: nft?.token_address,
    };
    setIsPending(true);

    try {
      const tx = await Moralis.transfer(options);
      console.log(tx);
      setIsPending(false);
    } catch (e) {
      alert(e.message);
      setIsPending(false);
    }
  }

  const handleTransferClick = (nft) => {
    setNftToSend(nft);
    setVisibility(true);
  };

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  console.log("NFTBalances", NFTBalances);
  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>🖼 NFT Balances</h1>
      <div style={styles.NFTs}>
        <Skeleton loading={!NFTBalances?.result}>
          {NFTBalances?.result &&
            NFTBalances.result.map((nft, index) => {
              //Verify Metadata
              nft = verifyMetadata(nft);
              if (nft.token_id === "6") {
                return <div></div>
              }
              return (
                <Card
                  hoverable
                  actions={[
                    // <Tooltip title="View On Blockexplorer">
                    //   <FileSearchOutlined
                    //     onClick={() =>
                    //       window.open(
                    //         `${getExplorer(chainId)}address/${
                    //           nft.token_address
                    //         }`,
                    //         "_blank"
                    //       )
                    //     }
                    //   />
                    // </Tooltip>,
                    <Tooltip title="Transfer NFT">
                      <SendOutlined onClick={() => handleTransferClick(nft)} />
                    </Tooltip>
                    // <Tooltip title="Sell On OpenSea">
                    //   <ShoppingCartOutlined
                    //     onClick={() => alert("OPENSEA INTEGRATION COMING!")}
                    //   />
                    // </Tooltip>,
                  ]}
                  style={{ width: 240, border: "2px solid #e7eaf3" }}
                  cover={
                    <Image
                      preview={false}
                      src={nft?.image || "error"}
                      fallback="https://lh3.googleusercontent.com/auzVHFdxDqG9Yjk_pWlHik99skzB-KlAnaBoSgPfDgs6A7gGRoeaioIDIT5s18PZTYbOJEfrazwi3ujUYT7s15nVF9Rm7-Dv7sT50V4=w600"
                      alt=""
                      style={{ height: "300px" }}
                    />
                  }
                  key={index}
                >
                  <Meta title={nft.name} description={nft.token_address} />
                </Card>
              );
            })}
        </Skeleton>
      </div>
      <Modal
        title={`Transfer ${nftToSend?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => transfer(nftToSend, amountToSend, receiverToSend)}
        confirmLoading={isPending}
        okText="Send"
      >
        <AddressInput autoFocus placeholder="Receiver" onChange={setReceiver} />
        {nftToSend && nftToSend.contract_type === "erc1155" && (
          <Input
            placeholder="amount to send"
            onChange={(e) => handleChange(e)}
          />
        )}
      </Modal>
    </div>
  );
}

export default NFTBalance;
