pragma solidity ^0.4.4;
import './Lockable.sol';

contract Operable is Lockable {
    mapping (address => bool) operators;

    function Operable() {
    }

    modifier isOperator() {
        require(operators[msg.sender] == true);
        _;
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
        OperatorAdded(operatorAddr);
    }
    // Only remove if msg is operator
    function removeOperator(address operatorAddr) onlyOwner {
        require(operators[operatorAddr] == true);
        delete operators[operatorAddr];
        OperatorRemoved(operatorAddr);
    }

    function checkOperator(address addr) view returns (bool) {
        return operators[addr];
    }
}