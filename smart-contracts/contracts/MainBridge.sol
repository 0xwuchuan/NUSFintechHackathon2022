// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract MainBridge is IERC721Receiver {
    IERC721 private mainNFT;

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    address gateway;

    event NFTLocked(
        address indexed requester,
        uint256 tokenId,
        uint256 timestamp
    );
    event NFTUnlocked(
        address indexed requester,
        uint256 tokenId,
        uint256 timestamp
    );

    constructor(address _mainNFT, address _gateway) {
        mainNFT = IERC721(_mainNFT);
        gateway = _gateway;
    }

    function lockNFT(address _requester, uint256 _tokenId)
        external
        onlyGateway
    {
        emit NFTLocked(_requester, _tokenId, block.timestamp);
    }

    function unlockNFT(address _requester, uint256 _tokenId)
        external
        onlyGateway
    {
        mainNFT.safeTransferFrom(address(this), _requester, _tokenId);
        emit NFTUnlocked(_requester, _tokenId, block.timestamp);
    }

    modifier onlyGateway() {
        require(
            msg.sender == gateway,
            "Only the gateway can execute this function"
        );
        _;
    }
}
