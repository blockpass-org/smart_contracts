pragma solidity ^0.4.4;
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
contract Operable is Pausable {
    mapping (address => bool) operators;

    constructor()
    {
    }

    modifier isOwnerOrOperator() {
        require(msg.sender == owner || operators[msg.sender] == true);
        _;
    }

    event OperatorAdded(address operatorAddr);
    event OperatorUpdated(address operatorAddr);
    event OperatorRemoved(address operatorAddr);

    // Only add if msg is not operator
    function addOperator(address operatorAddr) onlyOwner {
        require(operators[operatorAddr] == false);
        operators[operatorAddr] = true;
        emit OperatorAdded(operatorAddr);
    }
    // Only remove if msg is operator
    function removeOperator(address operatorAddr) onlyOwner {
        require(operators[operatorAddr] == true);
        delete operators[operatorAddr];
        emit OperatorRemoved(operatorAddr);
    }

    function checkOperator(address addr) view returns (bool) {
        return operators[addr];
    }
    
    function checkPause() view returns (bool){
        return paused;
    }
}