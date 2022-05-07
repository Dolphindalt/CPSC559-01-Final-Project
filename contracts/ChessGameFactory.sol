// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ChessGameFactory {

    mapping(uint => ChessGame) public games;
    mapping(address => uint[]) ownerToGames;
    mapping(uint => address) gameToOwner;
    mapping(uint256 => bool) gameHashSet;

    struct ChessGame {
        string game;
        string name;
        string white;
        string black;
        string date;
    }

    function isGameNovel(string memory game) view internal returns(bool) {
        return !gameHashSet[uint256(keccak256(bytes(game)))];
    }

    function validateGame(string memory game) pure internal returns(string memory, bool) {
        // TODO: Implement this later.
        return (game, true);
    }

    function createChessGame(uint id, string memory game, string calldata name, 
        string calldata white, string calldata black, string calldata date) internal {
            bool validationResult;
            (game, validationResult) = validateGame(game);

            require(validationResult == true, "An invalid long algebraic notation was submitted.");

            bool newGame = isGameNovel(game);

            require(newGame == true, "This game already exists as a minted ChessNFT.");
            
            games[id] = ChessGame(game, name, white, black, date);
            gameHashSet[uint256(keccak256(bytes(game)))] = true;
    }

    function compareGamesForEquality(ChessGame memory game1, ChessGame memory game2) pure public returns (bool) {
        return keccak256(bytes(game1.game)) == keccak256(bytes(game2.game));
    }

    function deleteGameFromOwner(ChessGame memory ownedGame, address owner) private {
        for (uint i = 0; i < ownerToGames[owner].length; i++) {
            if (compareGamesForEquality(ownedGame, games[ownerToGames[owner][i]])) {
                // Needs to be changed to fill this hole.
                delete ownerToGames[owner][i];
                delete ownerToGames[owner];
                break;
            }
        }
    }

    function transferChessGame(address from, address to, uint game) internal {
        // Remove the association of the game from the old owner.
        ChessGame memory ownedGame = games[game];

        deleteGameFromOwner(ownedGame, from);

        // Add the association to the new owner.
        gameToOwner[game] = to;
        ownerToGames[to].push(game);
    }

    function fectchGameByID(uint game) view internal returns (ChessGame memory, address) {
        address owner = gameToOwner[game];
        ChessGame memory gameStruct = games[game];
        return (gameStruct, owner);
    }

    function fetchGamesByOwner(address owner) view internal returns (uint[] memory, ChessGame[] memory, address) {
        uint len = ownerToGames[owner].length;
        ChessGame[] memory ownersGames = new ChessGame[](len);
        for (uint i = 0; i < len; i++) {
            ownersGames[i] = games[ownerToGames[owner][i]];
        }
        return (ownerToGames[owner], ownersGames, owner);
    }

    function destroyChessGame(uint game, address owner) internal {
        ChessGame memory ownedGame = games[game];
        deleteGameFromOwner(ownedGame, owner);
        delete games[game];
        delete gameToOwner[game];
        delete gameHashSet[uint256(keccak256(bytes(ownedGame.game)))];
    }

}