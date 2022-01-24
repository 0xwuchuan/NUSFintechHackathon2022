// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FakeApes is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // For indexing of tokens

    uint256 public constant MAX_SUPPLY = 10;

    string public baseTokenURI;

    constructor() ERC721("Fake Apes", "FAPES") {
        setBaseURI(
            "ipfs://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi/"
        );
        for (uint256 i = 0; i < 10; i++) {
            _mintOneToken();
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function _mintOneToken() private returns (uint256) {
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _tokenIds.increment();
        return newTokenId;
    }
}
