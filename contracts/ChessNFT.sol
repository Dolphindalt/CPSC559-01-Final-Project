// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./ChessGameFactory.sol";

contract ChessNFT is
  ChessGameFactory,
  ERC721,
  ERC721Enumerable,
  Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    uint private constant stringMaximumCharacters = 128;
    uint private constant gameMaximumCharacters = 1024;

    event ChessNFTCreated(uint256 tokenId);

    constructor() ERC721("ChessNFT", "CNFT") {
        
    }

    function fetchToken(uint tokenId) view public returns (ChessGame memory, address) {
        return fectchGameByID(tokenId);
    }

    function fetchOwnersTokens(address owner) view public returns (ChessGame[] memory) {
        return fetchGamesByOwner(owner);
    }

    function mintItem(string memory game, string calldata name, 
        string calldata white, string calldata black, string calldata date) public {
            require(bytes(game).length <= gameMaximumCharacters, "Game length is too long, must be 1024 bytes or less.");
            require(bytes(white).length <= stringMaximumCharacters, "Metadata is too long.");
            require(bytes(black).length <= stringMaximumCharacters, "Metadata is too long.");
            require(bytes(name).length <= stringMaximumCharacters, "Metadata is too long.");
            require(bytes(date).length <= stringMaximumCharacters, "Metadata is too long.");
            
            uint256 id = mintItem(msg.sender);
            createChessGame(id, game, name, white, black, date);

            // If a function is not a view or pure, it cannot return any data to the external caller.
            // We use an event instead.
            emit ChessNFTCreated(id);
    }

    function mintItem(address to) private returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        return tokenId;
    }

    function destroyToken(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Sender does not own this NFT.");
        _burn(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
        transferChessGame(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721)
    {
        super._burn(tokenId);
        destroyChessGame(tokenId, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
