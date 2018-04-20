# PASS Token smart contract

### hasUpgrade
* @dev checks if an upgraded version of Pass token contract is available
* @return 
    * true new upgrade token is setup
    * exception otherwise
```
modifier hasUpgrade()
```

## List of core events
### LogMint
* @dev will be triggered every time a user mints his current token to the upgraded one
* @param 
    * beneficiary receiving address
    * amount amount of token to be minted
```
event LogMint(address beneficiary, uint256 amount);
```

## List of core functions
### constructor
* @dev initialize default attributes for the Pass token contract
```
function Pass1() 
    DetailedERC20 ("Blockpass","PASS",6);
```

### upgrade
Assign address of the new Pass token contract
* @dev assign address of the new Pass token contract, can only be triggered by owner address
* @param 
    * _newToken address of the new Token contract
* @return none
```
function upgrade(MintableToken _newToken)
    onlyOwner 
    public;
```
### burn
* @dev override from BurnableToken
* @param 
    * _value amount of token to burn
* @return exception to prevent calling directly to Pass1 token
```
function burn(uint256 _value) 
    public;
```

### mint
* @dev override from MintableToken
* @param _to address of receivers
    * _amount amount of token to redeem to
* @return exception to prevent calling directly to Pass1 token
```
function mint(address _to, uint256 _amount) 
    onlyOwner 
    canMint 
    public 
    returns (bool);
```

### mintTo
* @dev allow whitelisted user to redeem his Pass1 token to a newer version of the token
        * can only be triggered if there's a newer version of Pass token, and when the contract is pause
* @param none
* @return none
```
function mintTo() 
    hasUpgrade 
    whenPaused
    onlyWhitelisted
    public;
```

### transfer
* @dev transfer ownership of token between whitelisted accounts
    * can only be triggered when contract is not paused
* @param 
    * _to address of receiver
    * _value amount to token to transfer
* @return 
    * true if transfer succeeds
    * false if not enough gas is provided, or if _value is larger than current user balance
```
function transfer(address _to, uint256 _value) 
    whenNotPaused
    onlyWhitelisted 
    public 
    returns (bool success);
```

### transferFrom
* @dev transfer ownership of token on behalf of one whitelisted account address to another
    * can only be triggered when contract is not paused
* @param 
    * _from sending address
    * _to receiving address
    * _value amount of token to transfer
* @return 
    * true if transfer succeeds
    * false if not enough gas is provided, or if _value is larger than maximum allowance / user balance
```
function transferFrom(address _from, address _to, uint256 _value) 
    whenNotPaused
    public 
    returns (bool success) 
```

### checkUserWhiteList
* @dev check if the specified address is in the contract whitelist
* @param 
    * _addr user address
* @return 
    * true if user address is in whitelist
    * false otherwise
```
function checkUserWhiteList(address _user) 
    view 
    public 
    returns (bool);
```

### addAddressToWhiteList
* @dev add an user address to the contract whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
* @param 
    * addr address to be added
* @return 
    * true if address is successfully added
    * false if address is already in the whitelist
```
function addAddressToWhitelist(address addr) 
    isOwnerOrOperator
    public 
    returns(bool success);
```

### addAddressesToWhitelist
* @dev add addresses to the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
* @param 
    * addrs addresses
* @return 
    * true if at least one address was added to the whitelist, 
    * false if all addresses were already in the whitelist  
```
function addAddressesToWhitelist(address[] addrs) 
    isOwnerOrOperator
    public returns(bool success);
```

### removeAddressFromWhitelist
* @dev remove an address from the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
* @param 
    * addr address
* @return 
    * true if the address was removed from the whitelist, 
    * false if the address wasn't in the whitelist in the first place 
```
function removeAddressFromWhitelist(address addr) 
    isOwnerOrOperator
    public 
    returns(bool success) 
```

### removeAddressesFromWhitelist
* @dev remove addresses from the whitelist
    * override from WhiteList contract to allow calling from owner or operators addresses
* @param 
    * addrs addresses
* @return 
    * true if at least one address was removed from the whitelist, 
    * false if all addresses weren't in the whitelist in the first place
```
function removeAddressesFromWhitelist(address[] addrs) 
    isOwnerOrOperator
    public 
    returns(bool success) 
```