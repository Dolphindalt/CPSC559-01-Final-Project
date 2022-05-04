const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ChessNFT = artifacts.require("ChessNFT.sol");
const MarketPlace = artifacts.require("MarketPlace.sol");

contract("MarketPlace", (accounts) => {
    let [alice, bob] = accounts;
    let contractInstance;
    let mpContractInstance;
    let validGame = "e2e4 e7e5 Ng1f3 Nb8c6 Bf1b5 a7a6 Bb5xc6 d7xc6 d2d3 Bf8b4+ Nb1c3 Ng8f6 O-O Bb4xc3";

    beforeEach(async () => {
        contractInstance = await ChessNFT.new();
        mpContractInstance = await MarketPlace.new();
    });

    it("Should be able to create market item, market sale, and fetch items", async () => {
        let game = validGame;
        let white = "Hegel";
        let black = "Immanuel Kant";
        let date = Date.now().toString();
        let name = "Unification of synthetic and analytical knowledge match";

        let tx = await contractInstance.mintItem(game, name, white, black, date, { from: alice });

        truffleAssert.eventEmitted(tx, 'ChessNFTCreated', async (e) => {
            let mintedToken = e.tokenId;
            
            //Create market item
            let tx2 = await mpContractInstance.createMarketItem(contractInstance, mintedToken, 100);
            truffleAssert.eventEmitted(tx2, 'MarketItemCreated', async(e)=>{
                let itemId = e.itemId;
                assert.equal(e.tokenID, mintedToken); //Token is the minted token
                assert.equal(e.seller, alice); //Seller should be alice
                assert.equal(e.owner, alice); //Owner should be alice
                assert.equal(e.price, 100); //Check price
                assert.equal(e.sold, false); //Should not be sold yet

                //Create market sale
                let tx3 = await mpContractInstance.createMarketSale(contractInstance, itemId);
                truffleAssert.eventEmitted(tx3, 'MarketItemSold', async(e)=>{
                    assert.equal(e.itemId, itemId); //Check if market sale has correct market item
                    assert.equal(e.owner, alice);   //Owner of market sale should be alice

                    //Fetch market items and find newly created item
                    let marketItems = await mpContractInstance.fetchMarketItems();
                    let targetItem = marketItems.find((elem)=>{return elem.itemId = itemId});
                    assert.notEqual(targetItem, null);
                    assert.equal(targetItem.tokenID, mintedToken); //Token is the minted token
                    assert.equal(targetItem.seller, alice); //Seller should be alice
                    assert.equal(targetItem.owner, alice); //Owner should be alice
                    assert.equal(targetItem.price, 100); //Check price

                    await chessNFTContractInstance.destroyToken(mintedToken, { from: alice });
                });
            });
        });
    });

});