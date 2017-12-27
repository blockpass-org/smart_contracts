pragma solidity ^0.4.8;
import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "./Operable.sol";

contract Pass1 is StandardToken, Operable {

    mapping (address => bool) whiteList;
    mapping (address => bool) redeemables;

    event UserAdded(address userAddr, address operatorAddr);
    event UserRemoved(address userAddr, address operatorAddr);

    function Pass1() {
        owner = msg.sender;
        // initial token amount is 10^9 (1 billion), divisible to 6 decimals
        totalSupply = 1000000000000000;
        balances[owner] = totalSupply;
    }

    function addUser(address addr) isOwnerOrOperator {
        whiteList[addr] = true;
        UserAdded(addr, msg.sender);
    }

    function removeUser(address addr) isOwnerOrOperator {
        whiteList[addr] = false;
        UserRemoved(addr, msg.sender);
    }

    function addRedeemable(address redeemableAddr) onlyOwner public {
        redeemables[redeemableAddr] = true;
    }

    function removeRedeemable(address redeemableAddr) onlyOwner public {
        delete redeemables[redeemableAddr];
    }

    function redeem(address to, uint256 amount) public {
        // I'm the firstborn, no one can redeem to me
        revert();
    }

    function redeemTo(address to, address _toOwner, uint256 amount) contractIsUnlock public {
        require(whiteList[msg.sender] == true && whiteList[_toOwner] == true);
        require(to != address(0x0) && balances[msg.sender] >= amount);
        require(redeemables[to] == true);

        balances[msg.sender] -= amount;

        if (!to.call.gas(msg.gas)(bytes4(keccak256("redeem(address,uint256)")), _toOwner, amount))
            revert();
    }

    // ERC20 functions
    function transfer(address _to, uint256 _value) contractIsUnlock public returns (bool success) {
        require(whiteList[_to] == true);
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) contractIsUnlock public returns (bool success) {
        require(whiteList[_to] == true);
        return super.transferFrom(_from, _to, _value);
    }
}