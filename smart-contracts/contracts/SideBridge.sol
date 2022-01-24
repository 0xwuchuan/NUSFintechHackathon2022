// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC721Child} from "./IERC721Child.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract SideBridge is Ownable, IERC721Receiver {
    event BridgeInitialized(uint256 indexed timestamp);
    event NFTBridged(
        address indexed requester,
        uint256 tokenId,
        uint256 timestamp
    );
    event NFTReturned(
        address indexed requester,
        uint256 tokenId,
        uint256 timestamp
    );

    IERC721Child private sideNFT;
    bool bridgeInitState;
    address gateway;

    constructor(address _gateway) {
        gateway = _gateway;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function initializeBridge(address _childTokenAddress) external onlyOwner {
        sideNFT = IERC721Child(_childTokenAddress);
        bridgeInitState = true;
    }

    function bridgeNFT(address _requester, uint256 _tokenId)
        external
        verifyInitialization
        onlyGateway
    {
        sideNFT.mint(_requester, _tokenId);
        emit NFTBridged(_requester, _tokenId, block.timestamp);
    }

    function returnNFT(address _requester, uint256 _tokenId)
        external
        verifyInitialization
        onlyGateway
    {
        sideNFT.burn(_tokenId);
        emit NFTReturned(_requester, _tokenId, block.timestamp);
    }

    modifier verifyInitialization() {
        require(bridgeInitState == true, "Bridge not initialized");
        _;
    }

    modifier onlyGateway() {
        require(
            msg.sender == gateway,
            "Only gateway can execute this function"
        );
        _;
    }
}
