const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ChessNFT = artifacts.require("ChessNFT.sol");

contract("ChessNFT", (accounts) => {
    let [alice] = accounts;
    let contractInstance;
    let validGame = "e2e4 e7e5 Ng1f3 Nb8c6 Bf1b5 a7a6 Bb5xc6 d7xc6 d2d3 Bf8b4+ Nb1c3 Ng8f6 O-O Bb4xc3";

    beforeEach(async () => {
        contractInstance = await ChessNFT.new();
    });

    it("should be able to mint a chess game into an NFT", async () => {
        let game = validGame;
        let white = "Hegel";
        let black = "Immanuel Kant";
        let date = Date.now().toString();
        let name = "Unification of synthetic and analytical knowledge match";

        let tx = await contractInstance.mintItem(game, name, white, black, date, { from: alice });

        truffleAssert.eventEmitted(tx, 'ChessNFTCreated', async (e) => {
            let mintedToken = e.tokenId;

            let getResult = await contractInstance.fetchToken(mintedToken, { from: alice });
            let metadata = getResult[0];
            let owner = getResult[1];

            assert.equal(String(metadata['black']), black);
            assert.equal(owner, alice);

            await contractInstance.destroyToken(mintedToken, { from: alice });
        });

    });
});