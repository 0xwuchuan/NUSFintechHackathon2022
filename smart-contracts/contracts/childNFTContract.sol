// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract NFTChild is ERC721, ERC721Burnable {
    address bridge;

    constructor(address _bridge) ERC721("Fake Apes", "FAPE") {
        bridge = _bridge;
    }

    function mint(address _recipient, uint256 _tokenId) public onlyBridge {
        _safeMint(_recipient, _tokenId);
    }

    function burn(uint256 _tokenId)
        public
        virtual
        override(ERC721Burnable)
        onlyBridge
    {
        super.burn(_tokenId);
    }

    modifier onlyBridge() {
        require(
            msg.sender == bridge,
            "Only bridge has access to this child NFT transfer"
        );
        _;
    }
}
