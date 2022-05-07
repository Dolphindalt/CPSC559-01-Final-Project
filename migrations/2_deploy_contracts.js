let chessNFT = artifacts.require("ChessNFT.sol");
let marketplace = artifacts.require("MarketPlace.sol");

module.exports = function(deployer) {
    deployer.deploy(chessNFT);
    deployer.deploy(marketplace);
}