pragma solidity ^0.4.4;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Lockable is Ownable {
    bool lock;

    function Lockable() 
        Ownable()
    {
        lock = false;
    }

    modifier contractIsLock() {
        require(lock == true);
        _;
    }

    modifier contractIsUnlock() {
        require(lock == false);
        _;
    }

    function lockContract() onlyOwner {
        lock = true;
    }

    function unlockContract() onlyOwner {
        lock = false;
    }
}