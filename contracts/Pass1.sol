pragma solidity ^0.4.8;
import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/ownership/Whitelist.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Operable.sol";

contract Pass1 is DetailedERC20, PausableToken, BurnableToken, MintableToken, Operable, Whitelist
{

    using SafeMath for uint256;
    
    MintableToken public newToken = MintableToken(0x0);

    /*
    * @dev will be triggered every time a user mints his current token to the upgraded one
    * @param beneficiary receiving address
    * amount amount of token to be minted
    */
    event LogMint(address beneficiary, uint256 amount);

    /*
    * @dev checks if an upgraded version of Pass token contract is available
    * @return true new upgrade token is setup
    * exception otherwise
    */
    modifier hasUpgrade() {
        require(newToken != MintableToken(0x0));
        _;
    }

    /*
    * @dev initialize default attributes for the Pass token contract
    */
    constructor() 
        DetailedERC20 ("Blockpass","PASS",6)
    {
        owner = msg.sender;
        emit OwnershipTransferred(address(0x0), owner);
        // initial token amount is 10^9 (1 billion), divisible to 6 decimals
        totalSupply_ = 1000000000000000;
        balances[owner] = totalSupply_;
        emit Transfer(address(0x0), owner, 1000000000000000);
        whitelist[owner] = true;
        emit WhitelistedAddressAdded(owner);
    }

    /*
    * @dev assign address of the new Pass token contract, can only be triggered by owner address
    * @param _newToken address of the new Token contract
    * @return none
    */
    function upgrade(MintableToken _newToken) 
        onlyOwner 
        public  
    {
        newToken = _newToken;
    }

    /*
    * @dev override from BurnableToken
    * @param _value amount of token to burn
    * @return exception to prevent calling directly to Pass1 token
    */
    function burn(uint256 _value) 
        public 
    {
        revert();
        _value = _value; // to silence compiler warning
    }

    /*
    * @dev override from MintableToken
    * @param _to address of receivers
    * _amount amount of token to redeem to
    * @return exception to prevent calling directly to Pass1 token
    */
    function mint(address _to, uint256 _amount) 
        onlyOwner 
        canMint 
        public 
        returns (bool) 
    {
        revert();
        return true;
    }

    /*
    * @dev allow whitelisted user to redeem his Pass1 token to a newer version of the token
    * can only be triggered if there's a newer version of Pass token, and when the contract is pause
    * @param none
    * @return none
    */
    function mintTo() 
        hasUpgrade 
        whenPaused
        onlyWhitelisted
        public 
    {
        uint256 balance = balanceOf(msg.sender);

        // burn the tokens in this token smart contract
        super.burn(balance);

        // mint tokens in the new token smart contract
        require(newToken.mint(msg.sender, balance));
        emit LogMint(msg.sender, balance);
    }
    
    /*
    * @dev transfer ownership of token between whitelisted accounts
    * can only be triggered when contract is not paused
    * @param _to address of receiver
    * _value amount to token to transfer
    * @return true if transfer succeeds
    * false if not enough gas is provided, or if _value is larger than current user balance
    */
    function transfer(address _to, uint256 _value) 
        whenNotPaused
        onlyWhitelisted 
        public 
        returns (bool success) 
    {
        return super.transfer(_to, _value);
    }

    /*
    * @dev transfer ownership of token on behalf of one whitelisted account address to another
    * can only be triggered when contract is not paused
    * @param _from sending address
    * _to receiving address
    * _value amount of token to transfer
    * @return true if transfer succeeds
    * false if not enough gas is provided, or if _value is larger than maximum allowance / user balance
    */
    function transferFrom(address _from, address _to, uint256 _value) 
        whenNotPaused
        public 
        returns (bool success) 
    {
        require(whitelist[_from] == true);
        return super.transferFrom(_from, _to, _value);
    }

    /*
    * @dev check if the specified address is in the contract whitelist
    * @param _addr user address
    * @return true if user address is in whitelist
    * false otherwise
    */
    function checkUserWhiteList(address addr) 
        view 
        public 
        returns (bool) 
    {
        return whitelist[addr];
    }

    /*
    * @dev add an user address to the contract whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
    * @param addr address to be added
    * @return true if address is successfully added
    * false if address is already in the whitelist
    */
    function addAddressToWhitelist(address addr) 
        isOwnerOrOperator
        public 
        returns(bool) 
    {
        if (!whitelist[addr]) {
            whitelist[addr] = true;
            emit WhitelistedAddressAdded(addr);
            return true;
        }
        return false;
    }

    /**
    * @dev add addresses to the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
    * @param addrs addresses
    * @return true if at least one address was added to the whitelist, 
    * false if all addresses were already in the whitelist  
    */
    function addAddressesToWhitelist(address[] addrs) 
        isOwnerOrOperator
        public 
        returns(bool success) 
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (addAddressToWhitelist(addrs[i])) {
                success = true;
            }
        }
    }

    /**
    * @dev remove an address from the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
    * @param addr address
    * @return true if the address was removed from the whitelist, 
    * false if the address wasn't in the whitelist in the first place 
    */
    function removeAddressFromWhitelist(address addr) 
        isOwnerOrOperator
        public 
        returns(bool success) 
    {
        require(addr != owner);
        if (whitelist[addr]) {
            whitelist[addr] = false;
            emit WhitelistedAddressRemoved(addr);
            success = true;
        }
    }

    /**
    * @dev remove addresses from the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
    * @param addrs addresses
    * @return true if at least one address was removed from the whitelist, 
    * false if all addresses weren't in the whitelist in the first place
    */
    function removeAddressesFromWhitelist(address[] addrs) 
        isOwnerOrOperator
        public 
        returns(bool success) 
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (removeAddressFromWhitelist(addrs[i])) {
                success = true;
            }
        }
    }
}