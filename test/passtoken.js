var Pass1 = artifacts.require('../contracts/Pass1.sol');
var Pass15 = artifacts.require('../contracts/Pass1_5.sol');
const assertRevert = require('zeppelin-solidity/test/helpers/assertRevert.js');

contract('Pass1', function(accounts) {
    // Test cases for Ownable
    let instance;
    let instance15;
    // Start before everytime insert checking
    beforeEach(async function () {
        instance = await Pass1.deployed();
        instance15 = await Pass15.deployed();
    });
    // Deployer is owner
    it("Should treat deployer as its owner", async function() {
        let owner = await instance.owner();
        assert.isTrue(accounts[0] === owner);
        owner = await instance15.owner();
        assert.isTrue(accounts[0] === owner);
    });
    // Always have an owner
    it ("Should always have an owner", async function(){
        let owner = await instance.owner();
        assert.isTrue(owner !== 0);
        owner = await instance15.owner();
        assert.isTrue(accounts[0] !== 0);
    });
    // Only owner can transfer ownership
    // Prevent non-owner to transfer ownership
    it("Should be able to transfer ownership only by owner", async function() {
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

        // accounts[0] is still the owner of 2nd contract
        let owner = await instance15.owner();
        assert.isTrue(accounts[0] === owner);
    
        try {
            await instance.transferOwnership(accounts[0], {from: accounts[1]});
        } catch (err) {
            assertRevert(err);
        }
    });
    // Prevent transfer to null
    it("Should guard from transfer ownership to stuck state", async function(){
        let owner = await instance.owner();
        try {
            await instance.transferOwnership(null, { from: owner });
            assert.fail('Ownship in stuck state');
          } catch (error) {
            assertRevert(error);
          }
    });
    // Test cases for Operable
    // Test add Operators
    // Non-owner can not add more operators
    it("Should prevent non-owner to add operator", async function() {
        try {
            await instance.addOperator(accounts[1], {from: accounts[2]});
            assert.fail('Only owner can add more operator');
        } catch (err) {
            assertRevert(err)
        }
    });
    // Only owner can add more operators
    it("Should allow only owner to update operator", async function() {
        

        await instance.addOperator(accounts[1], {from: accounts[0]});
        let isOperator = await instance.checkOperator(accounts[1]);
        assert.equal(isOperator, true, `Accounts ${accounts[1]} must be operator`);
    });
    // Even operator can not add more operator
    it("Should even prevent operator to add more operator", async function() {
        
        try {
            await instance.addOperator(accounts[1], {from: accounts[0]});
            await instance.addOperator(accounts[2], {from: accounts[1]});
            assert.fail('Only owner can add more operator');
        } catch (err) {
            assertRevert(err);
        }
    });
    
    // Test remove Operators    
    // Only owner can remove operators
    // First add two operator
    // Test operator code
    // isOperator = await instance.checkOperator(accounts[1]);
    // assert.equal(isOperator, true, `Account ${accounts[1]} must be operator`)
    it("Should allow only owner to remove operator", async function() {
        await instance.addOperator(accounts[2], {from: accounts[0]});
        await instance.removeOperator(accounts[2], {from: accounts[0]});
        let isOperator = await instance.checkOperator(accounts[2]);
        assert.equal(isOperator, false, `Account ${accounts[2]} must not be operator`)
    });
    // Non-owner can not remove operators
    it("Should prevent non-owner to remove operator",async function(){
        try {
            await instance.addOperator(accounts[1], {from: accounts[0]});
            let isOperator = await instance.checkOperator(accounts[1]);
            assert.equal(isOperator, true, `Account ${accounts[1]} must be operator`);
            await instance.removeOperator(accounts[1], {from: accounts[2]});
            assert.fail('Only owner can remove more operator');
        } catch (err) {
            assertRevert(err)
        }
    });
    // Even operator can not remove more operator
    it("Should even prevent operator to remove operator",async function(){
        try {
            await instance.addOperator(accounts[1], {from: accounts[1]});
            let isOperator = await instance.checkOperator(accounts[1]);
            assert.equal(isOperator, true, `Account ${accounts[1]} must not be operator`);
            await instance.removeOperator(accounts[1], {from: accounts[1]});
            assert.fail('Only owner can remove more operator');
        } catch (err) {
            assertRevert(err)
        }
    });
    // Everyone have right to check current operator;
    // Test updateLevel Operator
    // Logical operation same as Add Operator - 13/3/2018

    // test cases for lock / unlock functions
    // it("Should be locked only by owner", async function() {
    //     try {
    //         await instance.lockContract({from: accounts[1]});
    //         assert.fail();
    //     } catch (err) {
    //         assertRevert(err);
    //     }
    // })
    // it("Should be unlocked only by owner", async function() {
    //     try {
    //         await instance.unlockContract({from: accounts[1]});
    //         assert.fail();
    //     } catch (err) {
    //         assertRevert(err);
    //     }
    // })
    // it("Should be locked only by owner", async function() {
    //     let owner = instance.owner();
    //     await instance.lockContract({owner});
    // })
    // it("Should be unlocked only by owner", async function() {
    //     let owner = instance.owner();
    //     await instance.unlockContract({owner});
    // })

    // Test cases for Standard token
    // Test inital total supply
    it("Should create suitable total supply", async function() {
        let expectedToken = 1000000000000000;

        let balance = await instance.totalSupply();
        balance = balance.toNumber();
        assert.equal(expectedToken, balance, `Total Supply should be ${expectedToken}`)
    });
    it("Should transfer total supply to owner in the first time", async function() {

        let expectedToken = 1000000000000000;

        let owner = await instance.owner();
        let ownerBalance = await instance.balanceOf(owner);
        assert.equal(expectedToken, ownerBalance, `Owner should have ${expectedToken}`)
    });
    it("Should add creater to whitelist", async function() {
        let owner = await instance.owner();
        let isInWhiteList = await instance.checkUserWhiteList(owner);
        assert.equal(isInWhiteList, true, `Owner should be in white list ${isInWhiteList}`);
    });
    it("Should allow owner and operator to add or remove user", async function() {
        await instance.addUser(accounts[1],{from: accounts[0]});
        let isInWhiteList = await instance.checkUserWhiteList(accounts[1]);
        assert.equal(isInWhiteList, true, `${accounts[1]} should be in white list ${isInWhiteList}`);

        await instance.addOperator(accounts[2], {from: accounts[0]});

        await instance.addUser(accounts[3],{from: accounts[2]});
        isInWhiteList = await instance.checkUserWhiteList(accounts[3]);
        assert.equal(isInWhiteList, true, `${accounts[3]} should be in white list ${isInWhiteList}`);

        await instance.removeUser(accounts[1],{from: accounts[0]});
        isInWhiteList = await instance.checkUserWhiteList(accounts[1]);
        assert.equal(isInWhiteList, false, `${accounts[1]} should not be in white list ${isInWhiteList}`);

        await instance.removeUser(accounts[3],{from: accounts[2]});
        isInWhiteList = await instance.checkUserWhiteList(accounts[3]);
        assert.equal(isInWhiteList, false, `${accounts[3]} should not be in white list ${isInWhiteList}`);

        await instance.removeOperator(accounts[2], {from: accounts[0]});
    })
    it("Should prevent non-owner or non-operator to add or remove user", async function() {
        try {
            await instance.addUser(accounts[1],{from: accounts[2]});
        } catch(err) {
            assertRevert(err)
        }
        try {
            await instance.addUser(accounts[1],{from: accounts[0]});
            await instance.removeUser(accounts[1],{from: accounts[2]});
        } catch(err) {
            await instance.removeUser(accounts[1], {from: accounts[0]});
        }
    })
    // Transfer
    it("Should allow user in whitelist to transfer & allow to transfer to user not in whitelist", async function() {
        
        let expectedToken = 1000000000000000;

        let balance = await instance.balanceOf(accounts[0]);
        balance = balance.toNumber();
        
        assert.equal(balance, expectedToken, `Account ${accounts[0]} must have ${expectedToken} tokens`);

        // Allow to transfer to user outside whitelist
        await instance.transfer(accounts[1], 1000000, {from: accounts[0]});
        await instance.addUser(accounts[1]);

        balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, expectedToken - 1000000, `Account ${accounts[0]} must have 900 tokens`);

        balance = await instance.balanceOf(accounts[1]);
        assert.equal(balance, 1000000, `Account ${accounts[1]} must have 100 tokens`);
    })
    it("Should not allow transfering if sender is outside whitelist", async function() {
       
        await instance.removeUser(accounts[1], {from: accounts[0]});
       
        try {
            await instance.transfer(accounts[2], 100, {from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should not allow transfering if sender doesn't have enough balance", async function() {

        await instance.addUser(accounts[1], {from: accounts[0]});
        await instance.addUser(accounts[2], {from: accounts[0]});

        try {
            await instance.transfer(accounts[2], 2000000, {from: accounts[1]})
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })

    // it("Should not allow transfer functions if contract is locked", async function() {
    //     await instance.lockContract({from: accounts[0]});

    //     await instance.addUser(accounts[3], {from: accounts[0]});
    //     try {
    //         await instance.transfer(accounts[3], 2000000, {from: accounts[0]})
    //     } catch (err) {

    //     }
    //     let balance = await instance.balanceOf(accounts[3]);
    //     balance = balance.toNumber();
    //     assert.equal(balance, 0, `Account ${accounts[3]} must have 0 token`);
    //     try {
    //         await instance.unlockContract({from: accounts[0]});
    //         await instance.transfer(accounts[3], 2000000, {from: accounts[0]});
    //     } catch (err) {
    //         assert(false, `Must allow operator(s) to add user while contract is locked`)
    //     }
    //     balance = await instance.balanceOf(accounts[3]);
    //     assert.equal(balance, 2000000, `Account ${accounts[3]} must have 2000000 tokens`);
    // })

    //Transfer from
    it("Should allow user to approve other user in whitelist to transfer his/her money", async function() {
        let balance = await instance.balanceOf(accounts[0]);
        balance = balance.toNumber();
        let expectedToken = balance;

        await instance.approve(accounts[5], 2000000, {from: accounts[0]})

        await instance.transferFrom(accounts[0], accounts[6], 1000000, {from: accounts[5]});


        balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, expectedToken - 1000000, `Account ${accounts[0]} must have 900 tokens`);

        balance = await instance.balanceOf(accounts[5]);
        assert.equal(balance, 0, `Account ${accounts[5]} must have 0 tokens`);

        balance = await instance.balanceOf(accounts[6]);
        assert.equal(balance, 1000000, `Account ${accounts[6]} must have 100 tokens`);
    })    
    it("Should prevent other user in whitelist to transfer other money more than his/her approval", async function() {
        try
        {
            await instance.transferFrom(accounts[0], accounts[6], 3000000, {from: accounts[5]});
            assert.fail();
        } catch(err){
            assertRevert(err);
        }
    })

    it("Should prevent user not in whitelist to transfer money through others approval", async function() {
        await instance.approve(accounts[7], 1000000, {from: accounts[6]})
        try
        {
            await instance.transferFrom(accounts[7], accounts[8], 1000000, {from: accounts[6]});
            assert.fail();
        } catch(err){
            assertRevert(err);
        }
    })
    it("Should prevent other user in whitelist to transfer other money without his/her approval", async function() {
        try
        {
            await instance.transferFrom(accounts[0], accounts[8], 1000000, {from: accounts[7]});
            assert.fail();
        } catch(err){
            assertRevert(err);
        }
    })
    it("Should allow to increase/decrease approval", async function() {
        let balance = await instance.balanceOf(accounts[0]);
        balance = balance.toNumber();
        let expectedToken = balance;
        await instance.increaseApproval(accounts[5], 1000000, {from: accounts[0]})
        await instance.decreaseApproval(accounts[5], 2000000, {from: accounts[0]})
        try
        {
            await instance.transferFrom(accounts[0], accounts[6], 1000000, {from: accounts[5]});
            assert.fail();
        } catch(err){
            assertRevert(err);
        }
        balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, expectedToken, `Account ${accounts[0]} must have 900 tokens`);

        balance = await instance.balanceOf(accounts[5]);
        assert.equal(balance, 0, `Account ${accounts[5]} must have 0 tokens`);

        balance = await instance.balanceOf(accounts[6]);
        assert.equal(balance, 1000000, `Account ${accounts[6]} must have 100 tokens`);
    })

    // test cases for Redeem function
    it("Should allow only owner to add or remove redeem list", async function() {
        await instance.addRedeemable(accounts[1],{from: accounts[0]});
        let isInWhiteList = await instance.checkUserRedeemList(accounts[1]);
        assert.equal(isInWhiteList, true, `Owner should be in white list ${isInWhiteList}`);

        await instance.removeRedeemable(accounts[1],{from: accounts[0]});
        isInWhiteList = await instance.checkUserRedeemList(accounts[1]);
        assert.equal(isInWhiteList, false, `Owner should be in white list ${isInWhiteList}`);

    })
    it("Should prevent non-owner to add or remove redeem list", async function() {
        try {
            await instance.addRedeemable(accounts[1],{from: accounts[2]});
        } catch(err) {
            assertRevert(err)
        }
        try {
            await instance.addRedeemable(accounts[1],{from: accounts[0]});
            await instance.removeRedeemable(accounts[1],{from: accounts[2]});
        } catch(err) {
            await instance.removeRedeemable(accounts[1], {from: accounts[0]});
        }
    })
    
    it("Should only allow redeem function to work contracts in whitelist", async function() {
        // Add accounts[3] to whitelist and transfer to it 2000000 tokens
        await instance.addUser(accounts[3], {from: accounts[0]});
        await instance.transfer(accounts[3], 2000000, {from: accounts[0]});
        let balance = await instance.balanceOf(accounts[3]);
        balance = balance.toNumber()
        assert.equal(balance, 2000000, `Account ${accounts[3]} must have 2000000 tokens`);

        // should fail because accounts[4] has not been white listed
        try {
            await instance.redeemTo(instance15.address, accounts[4], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        let newBalance = await instance.balanceOf(accounts[3]);
        newBalance = newBalance.toNumber();
        assert.equal(newBalance, 2000000, `#1 Account ${accounts[3]} must have balance`);

        // should fail because accounts[3] has not enough token
        try {
            await instance.redeemTo(instance15.address, accounts[4], balance * 2, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await instance.balanceOf(accounts[3]);
        assert.equal(newBalance, 2000000, `#2 Account ${accounts[3]} must have balance`);

        // should fail because Pass1.5 has not been added to redeemable list
        try {
            await instance.redeemTo(instance15.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await instance15.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#3 Account ${accounts[3]} must not have any balance`);

        // should fail because accounts[3] has not been white-listed in Pass1.5
        await instance.addRedeemable(instance15.address)
        try {
            await instance.redeemTo(instance15.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await instance15.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#4 Account ${accounts[3]} must not have any balance`);

        // should fail because Pass1.5 does have valid conversion rate
        await instance15.addUser(accounts[3], {from: accounts[0]});
        try {
            await instance.redeemTo(instance15.address, accounts[3], balance, {from: accounts[3]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        newBalance = await instance15.balanceOf(accounts[3]);
        assert.equal(newBalance, 0, `#5 Account ${accounts[3]} must not have any balance`);
    });

    it("Should redeem token successfully", async function() {
        
         // accounts[3] is user and have 2000000 balance
        let balance = await instance.balanceOf(accounts[3]);
        balance = balance.toNumber();

        await instance.addRedeemable(instance15.address)
        //await instance15.addUser(accounts[3], {from: accounts[0]});
        await instance15.allowRedeemFrom(instance.address, 2, 1, {from: accounts[0]});
        await instance.redeemTo(instance15.address, accounts[3], balance, {from: accounts[3], gas: 3000000});
        
        balance = await instance.balanceOf(accounts[3]);
        balance = balance.toNumber();
        assert.equal(balance, 0, `Account ${accounts[3]} must not have any balance`);

        let newBalance = await instance15.balanceOf(accounts[3]);
        newBalance = newBalance.toNumber();
        assert.equal(newBalance, 4000000, `Account ${accounts[3]} must not have any balance`);
    })

    // Testcase for freeze and unfreeze
    it("Should prevent non-owner to freeze", async function() {
        try {
            await instance.freezeContract({from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should prevent non-owner to unfreeze", async function() {
        try {
            await instance.unFreezeContract({from: accounts[1]});
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
    })
    it("Should be freezed by owner", async function() {
        let owner = instance.owner();
        await instance.freezeContract({owner});
    })
    it("Should be unfreezeed by owner", async function() {
        let owner = instance.owner();
        await instance.unFreezeContract({owner});
    })
    // it("Should only redeem works when frozen", async function() {
    //     //frozen Pass1
    //     await instance.freeze({from: accounts[0]});
    //     await instance.addUser(accounts[3], {from: accounts[0]});
    //     try {
    //         await instance.transfer(accounts[3],100, {from: accounts[0]});
    //         assert.fail();
    //     }
    //     catch(err){
    //         assertRevert(err);
    //     }

    //     try {
    //         let balance = await instance.balanceOf(accounts[3]);
    //         balance = balance.toNumber();
    //         await instance.addRedeemable(instance15.address);
    //         await instance15.addUser(accounts[3], {from: accounts[0]});
    //         await instance15.allowRedeemFrom(instance.address, 2, 1, {from: accounts[0]});
    //         await instance.redeemTo(instance15.address, accounts[3], balance, {from: accounts[3], gas: 3000000});
        
    //         balance = await instance.balanceOf(accounts[3]);
    //         balance = balance.toNumber();
    //         assert.equal(balance, 0, `Account ${accounts[3]} must not have any balance`);
    //         let newBalance = await instance15.balanceOf(accounts[3]);
    //         newBalance = newBalance.toNumber();
    //         assert.equal(newBalance, 4000000, `Account ${accounts[3]} must not have any balance`);
    //     }
    //     catch (err) {
    //         assert(false, "Should redeem token successfully when frozen");
    //     }
    //})

    it("Should allow transfer to user when unfrozen", async function (){
        
        let balance = await instance.balanceOf(accounts[3]);
        balance = balance.toNumber();

        assert.equal(balance, 0, `Account ${accounts[3]} must have 0 token`);
        //frozen
        await instance.freezeContract({from: accounts[0]});
        try {
            await instance.transfer(accounts[3], 2000000, {from: accounts[0]})
            assert.fail();
        } catch (err) {
            assertRevert(err);
        }
        //unfrozen
        await instance.unFreezeContract({from: accounts[0]});
        try {
            await instance.transfer(accounts[3], 2000000, {from: accounts[0]});
        } catch (err) {
            assert(false, `Must allow operator(s) to add user while contract is frozen`)
        }
        balance = await instance.balanceOf(accounts[3]);
        assert.equal(balance, 2000000, `Account ${accounts[3]} must have 2000000 tokens`);
    })
});