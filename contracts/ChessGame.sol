// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ChessGameFactory {

    ChessGame[] public games;

    mapping(address => uint[]) ownerToGames;
    mapping(uint => address) gameToOwner;
    mapping(uint256 => bool) gameHashSet;

    struct ChessGame {
        bytes game;
        bytes name;
        bytes white;
        bytes black;
        bytes date;
    }

    function isGameNovel(bytes memory game) view internal returns(bool) {
        return gameHashSet[uint256(keccak256(game))];
    }

    function validateGame(bytes memory game) pure internal returns(bytes memory, bool) {
        return (game, true);
    }

    function createChessGame(bytes memory game, bytes calldata name, 
        bytes calldata white, bytes calldata black, bytes calldata date) public {
            bool validationResult;
            (game, validationResult) = validateGame(game);

            require(validationResult, "An invalid long algebraic notation was submitted.");

            bool newGame = isGameNovel(game);

            require(newGame, "This game already exists as a minted ChessNFT.");
            
            // Different from CryptoZombies example due to breaking changes in solidity 6.
            games.push(ChessGame(game, name, white, black, date));
            uint id = games.length - 1;
            ownerToGames[msg.sender].push(id);
            gameToOwner[id] = msg.sender;
    }

}