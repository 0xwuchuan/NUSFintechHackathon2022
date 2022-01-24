// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IERC721Child is IERC721Metadata {
    function mint(address recipient, uint256 tokenId) external;

    function burn(uint256 tokenId) external;

    function burnFrom(address account, uint256 tokenId) external;
}
