let notationReader = artifacts.require("NotationReader.sol");
let chessValidator = artifacts.require("ChessValidator.sol");

module.exports = function(deployer) {
    deployer.deploy(notationReader);
    deployer.deploy(chessValidator);
}