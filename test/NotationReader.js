const { assert } = require("chai");

const NotationReader = artifacts.require("NotationReader.sol");

function toBytes(string) {
	const buffer = Buffer.from(string, 'utf8');
	const result = Array(buffer.length);
	for (var i = 0; i < buffer.length; i++) {
		result[i] = buffer[i];
	}
	return result;
}

contract("NotationReader", (accounts) => {

    let [alice, bob] = accounts;
    let contractInstance;

    beforeEach(async () => {
        contractInstance = await NotationReader.new();
    });

    it("should be able to tokenize long algebraic notation", async () => {
        let inputString = toBytes("e2e4 e7e5 Ng1f3 Nb8c6 Bf1b5 a7a6 Bb5xc6 d7xc6 d2d3 Bf8b4+ Nb1c3 Ng8f6 O-O Bb4xc3");
        let marker = 0, token;
        let result = await contractInstance.getToken(marker, inputString, { from: alice });
        token = result[0];
        marker = result[1]; // Update marker.
        assert.equal(token.value, "e2");
        assert.equal(token.class, 4); // 4 -> SQUARE

        result = await contractInstance.getToken(marker, inputString, { from: alice });
        token = result[0];
        marker = result[1]; // Update marker.
        assert.equal(token.value, "e4");
        assert.equal(token.class, 4); // 4 -> SQUARE

        result = await contractInstance.getToken(marker, inputString, { from: alice });
        token = result[0];
        marker = result[1]; // Update marker.
        assert.equal(token.value, " ");
        assert.equal(token.class, 3); // 4 -> SPACE

        // Good enough for this functional test.
    });

});