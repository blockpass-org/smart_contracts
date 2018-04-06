pragma solidity ^0.4.8;
import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "./Operable.sol";

contract Pass1 is StandardToken, Operable {
    
    // whiteList
    //  list of account addresses which are whitelisted by Operators
    //  type: mapping
    //  usage: only Users in whiteList are able to send Pass token. Users not in whitelist are only able to receive Pass token
    mapping (address => bool) whiteList;

    // redeemables
    //  list of token smart contract addresses which users can transform their Pass1 token to
    //  type: mapping
    //  usage: in the future, when logical updates need to be integrated to the smart contract
    //          we can deploy an upgrade version of this smart contract, then allow user to convert
    //          their tokens from old smart contract to the new one
    mapping (address => bool) redeemables;

    // isFrozen
    //  check if contract is in frozen state
    //  type: boolean
    //  usage: frozen state will be used to force users to redeem current token to a newer one,
    //          in case of smart contract upgrade. In frozen state, all transfer can't be made 
    //          and user can only call redeem() function
    bool isFrozen = false;

    // event triggered when an user address is added to whitelist
    event UserAdded(address userAddr, address operatorAddr);

    // event triggered when an user address is removed from whitelist
    event UserRemoved(address userAddr, address operatorAddr);

    // event triggered when a token contract address is added to redeemable list
    event RedeemableAdded(address addr);

    // event triggered when a token contract address is removed from redeemable list
    event RedeemableRemoved(address addr);

    // constructor
    //  initially assign all token amount to owner address
    function Pass1() {
        owner = msg.sender;
        // initial token amount is 10^9 (1 billion), divisible to 6 decimals
        totalSupply = 1000000000000000;
        balances[owner] = totalSupply;
        whiteList[owner] = true;
    }

    // userInWhitelist
    //  modifier
    //  will throw if user is not in whitelist
    modifier userInWhitelist(address addr){
        require(whiteList[addr] == true);
        _;
    }

    // userNotInWhitelist
    //  modifier
    //  will throw if user is not in whitelist
    modifier userNotInWhitelist(address addr){
        require(whiteList[addr] == false);
        _;
    }

    modifier contractNotFrozen() {
        require(isFrozen == false);
        _;
    }

    // addUser
    //  function
    //  add new user to whitelist, can only be called by owner or operators
    function addUser(address addr) 
        userNotInWhitelist(addr) 
        isOwnerOrOperator 
        returns (bool success)
    {
        whiteList[addr] = true;
        UserAdded(addr, msg.sender);
        return true;
    }

    // removeUser
    //  function
    //  remove user from the whitelist, can only be called by owner or operators 
    function removeUser(address addr) 
        userInWhitelist(addr) 
        isOwnerOrOperator 
        returns (bool success)
    {
        require(addr != owner);
        whiteList[addr] = false;
        UserRemoved(addr, msg.sender);
        return true;
    }

    // checkUserWhiteList
    //  constant
    //  check if user is available in the whitelist
    function checkUserWhiteList(address addr) 
        view 
        public 
        returns (bool) 
    {
        return whiteList[addr];
    }

    // addRedeemable
    //  function
    //  add smart contract address to redeemable list, can only be called by owner
    function addRedeemable(address redeemableAddr) 
        onlyOwner 
        public 
        returns (bool success)
    {
        redeemables[redeemableAddr] = true;
        RedeemableAdded(redeemableAddr);
        return true;
    }

    // removeRedeemable
    //  function
    //  remove smart contract address from redeemable list, can only be called by owner
    function removeRedeemable(address redeemableAddr) 
        onlyOwner 
        public 
        returns (bool success)
    {
        require(redeemables[redeemableAddr] == true);
        delete redeemables[redeemableAddr];
        RedeemableRemoved(redeemableAddr);
        return true;
    }

    // checkUserRedeemList
    //  constant
    //  check if an address is in redeemable list
    function checkUserRedeemList(address addr) 
        view 
        public 
        returns (bool) 
    {
        return redeemables[addr];
    }

    // redeem
    //  function
    //  will be called when user wants to redeem another token to Pass1 token
    function redeem(address to, uint256 amount) 
        contractNotFrozen 
        public 
    {
        // I'm the firstborn, no one can redeem to me
        revert();
    }

    // redeemTo
    //  function
    //  will be called when user wants to redeem from Pass1 to another token, the receiving smart contract
    //  must implement the redeem(address,uint256) function
    function redeemTo(address to, address _toOwner, uint256 amount) 
        public 
    {
        require(whiteList[msg.sender] == true);
        require(to != address(0x0) && balances[msg.sender] >= amount);
        require(redeemables[to] == true);

        totalSupply -= amount;
        balances[msg.sender] -= amount;
        if (!to.call.gas(msg.gas)(bytes4(keccak256("redeem(address,uint256)")), _toOwner, amount))
            revert();
    }

    // ###  ERC20 functions ###
    
    // transfer
    //  function
    //  transfer ownership of token from one account address to another
    function transfer(address _to, uint256 _value) 
        contractNotFrozen 
        public 
        returns (bool success) 
    {
        require(whiteList[msg.sender] == true);
        return super.transfer(_to, _value);
    }

    // transferFrom
    //  function
    //  transfer ownership of token on behalf of one account address to another
    function transferFrom(address _from, address _to, uint256 _value) 
        contractNotFrozen 
        public 
        returns (bool success) 
    {
        require(whiteList[_from] == true);
        return super.transferFrom(_from, _to, _value);
    }

    // freezeContract
    //  function
    //  set smart contract to frozen state, can only be called by owner
    function freezeContract() 
        onlyOwner 
        public 
    {
        isFrozen = true;
    }

    // unfreezeContract
    //  function
    //  set smart contract to unfrozen state, can only be called by owner
    function unFreezeContract() 
        onlyOwner 
        public 
    {
        isFrozen = false;
    }
}