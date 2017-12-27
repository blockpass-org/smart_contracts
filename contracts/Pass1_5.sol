pragma solidity ^0.4.8;
import "./Pass1.sol";

contract Pass1_5 is Pass1 {

    struct ConvertRate {
        bool valid;
        uint256 numerator;
        uint256 denominator;
    }
    mapping (address => ConvertRate) tokenWhiteList;

    event UserAdded(address userAddr, address operatorAddr);
    event UserRemoved(address userAddr, address operatorAddr);

    function Pass1_5() {
        owner = msg.sender;
        totalSupply = 0;
        balances[owner] = totalSupply;
    }

    function allowRedeemFrom(address tokenAddress, uint256 numerator, uint256 denominator) onlyOwner public {
        ConvertRate rate;
        rate.valid = true;
        rate.numerator = numerator;
        rate.denominator = denominator;
        tokenWhiteList[tokenAddress] = rate;
    }

    function isConvertible(address tokenAddress) view public returns (bool) {
        return tokenWhiteList[tokenAddress].valid;
    } 

    function redeem(address to, uint256 amount) public {
        require(whiteList[to] == true);
        require(tokenWhiteList[msg.sender].valid == true);
        require(tokenWhiteList[msg.sender].numerator > 0 && tokenWhiteList[msg.sender].denominator > 0);

        uint256 _amount = (amount * tokenWhiteList[msg.sender].numerator) / tokenWhiteList[msg.sender].denominator;
        totalSupply += _amount;
        balances[to] += _amount;
    }
}