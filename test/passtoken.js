var Pass1 = artifacts.require('../contracts/Pass1.sol');
var Pass15 = artifacts.require('../contracts/Pass1_5.sol');
const assertRevert = require('zeppelin-solidity/test/helpers/assertRevert');

contract('Pass1', function(accounts) {
    // test cases for Ownable
    it("Should be able to transfer ownership only by owner", async function() {
        let instance = await Pass1.deployed();

        try {
            await instance.transferOwnership(accounts[2], {from: accounts[1]});
            assert.fail(`Owner must be ${accounts[0]}`);
        } catch (err) {
            assertRevert(err);
        }

        try {
            await instance.transferOwnership(accounts[1], {from: accounts[0]});
        } catch (err) {
            assert(false, `Owner ${accounts[0]} must be able to transfer ownership`);
        }

        try {
            await instance.transferOwnership(accounts[0], {from: accounts[1]});
        } catch (err) {
            assertRevert(err);
        }
    });

    // test cases for Operable
    it("Should allow only owner to add operator", async function() {
        let instance = await Pass1.deployed();

        try {
            await instance.addOperator(accounts[1], {from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err)
        }
    })
    it("Should allow only owner to add operator", async function() {
        let instance = await Pass1.deployed();

        await instance.addOperator(accounts[1], {from: accounts[0]});
        let isOperator = await instance.checkOperator(accounts[1]);
        assert.equal(isOperator, true, `Accounts ${accounts[1]} must be operator`);
    })
    it("Should allow only owner to add operator", async function() {
        let instance = await Pass1.deployed();

        try {
            await instance.addOperator(accounts[1], {from: accounts[0]});
            await instance.addOperator(accounts[2], {from: accounts[1]});
            assert.fail('abc');
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should allow only owner to add operator", async function() {
        let instance = await Pass1.deployed();

        await instance.addOperator(accounts[1], {from: accounts[0]});
        await instance.addOperator(accounts[2], {from: accounts[0]});
        await instance.removeOperator(accounts[2], {from: accounts[0]});
        let isOperator = await instance.checkOperator(accounts[2]);
        assert.equal(isOperator, false, `Account ${accounts[2]} must not be operator`)
    })

    // test cases for Standard token
    it("Should allow adding user to white list & transfer to user in whitelist", async function() {
        let instance = await Pass1.deployed();

        let expectedToken = 1000000000000000;

        let balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, expectedToken, `Account ${accounts[0]} must have 1000 tokens`);

        await instance.addUser(accounts[1]);
        await instance.transfer(accounts[1], 1000000, {from: accounts[0]})

        balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, expectedToken - 1000000, `Account ${accounts[0]} must have 900 tokens`);
        balance = await instance.balanceOf(accounts[1]);
        assert.equal(balance, 1000000, `Account ${accounts[1]} must have 100 tokens`);
    })
    it("Should not allow transfering to user outside white list", async function() {
        let instance = await Pass1.deployed();

        await instance.removeUser(accounts[1], {from: accounts[0]});

        try {
            await instance.transfer(accounts[1], 100, {from: accounts[0]})
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should not allow transfering if sender doesn't have enough balance", async function() {
        let instance = await Pass1.deployed();

        await instance.addUser(accounts[1], {from: accounts[0]});
        await instance.addUser(accounts[2], {from: accounts[0]});

        try {
            await instance.transfer(accounts[2], 2000000, {from: accounts[1]})
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })

    // test cases for lock / unlock functions
    it("Should be locked only by owner", async function() {
        let instance = await Pass1.deployed();

        try {
            await instance.lockContract({from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should be unlocked only by owner", async function() {
        let instance = await Pass1.deployed();

        try {
            await instance.unlockContract({from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should not allow transfer functions if contract is locked", async function() {
        let instance = await Pass1.deployed();

        await instance.lockContract({from: accounts[0]});
        try {
            await instance.transfer(accounts[3], 2000000, {from: accounts[0]})
        } catch (err) {

        }
        await instance.addUser(accounts[3], {from: accounts[0]});
        balance = await instance.balanceOf(accounts[3]);
        assert.equal(balance, 0, `Account ${accounts[3]} must have 0 token`);
        try {
            await instance.unlockContract({from: accounts[0]});
            await instance.transfer(accounts[3], 2000000, {from: accounts[0]});
        } catch (err) {
            assert(false, `Must allow operator(s) to add user while contract is locked`)
        }
        balance = await instance.balanceOf(accounts[3]);
        assert.equal(balance, 2000000, `Account ${accounts[3]} must have 2000000 tokens`);
    })

    // test cases for Redeem function
    it("Should only allow redeem function to work contracts in whitelist", async function() {
        let pass1Instance = await Pass1.deployed();
        let pass2Instance = await Pass15.deployed();

        let balance = await pass1Instance.balanceOf(accounts[3]);

        // should fail because accounts[4] has not been white listed
        try {
            await pass1Instance.redeemTo(pass2Instance.address, accounts[4], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        let newBalance = await pass1Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 2000000, `#1 Account ${accounts[3]} must have balance`);

        // should fail because accounts[3] has not enough token
        try {
            await pass1Instance.redeemTo(pass2Instance.address, accounts[4], balance * 2, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await pass1Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 2000000, `#2 Account ${accounts[3]} must have balance`);

        // should fail because Pass1.5 has not been added to redeemable list
        try {
            await pass1Instance.redeemTo(pass2Instance.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await pass2Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#3 Account ${accounts[3]} must not have any balance`);

        // should fail because accounts[3] has not been white-listed in Pass1.5
        await pass1Instance.addRedeemable(pass2Instance.address)
        try {
            await pass1Instance.redeemTo(pass2Instance.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await pass2Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#4 Account ${accounts[3]} must not have any balance`);

        // should fail because Pass1.5 does have valid conversion rate
        await pass2Instance.addUser(accounts[3], {from: accounts[0]});
        try {
            await pass1Instance.redeemTo(pass2Instance.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await pass2Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#5 Account ${accounts[3]} must not have any balance`);
    });

    it("Should redeem token successfully", async function() {
        let pass1Instance = await Pass1.deployed();
        let pass2Instance = await Pass15.deployed();

        let balance = await pass1Instance.balanceOf(accounts[3]);

        await pass1Instance.addRedeemable(pass2Instance.address)
        await pass2Instance.addUser(accounts[3], {from: accounts[0]});
        await pass2Instance.allowRedeemFrom(pass1Instance.address, 2, 1, {from: accounts[0]});
        await pass1Instance.redeemTo(pass2Instance.address, accounts[3], balance, {from: accounts[3], gas: 3000000});
        
        balance = await pass1Instance.balanceOf(accounts[3]);
        assert.equal(balance, 0, `Account ${accounts[3]} must not have any balance`);
        let newBalance = await pass2Instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 4000000, `Account ${accounts[3]} must not have any balance`);
    })
});