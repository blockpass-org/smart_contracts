pragma solidity ^0.4.4;
import './Lockable.sol';

contract Operable is Lockable {
    mapping (address => bool) operators;

    function Operable()
        Lockable()
    {
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

    function addOperator(address operatorAddr) onlyOwner {
        operators[operatorAddr] = true;
        OperatorAdded(operatorAddr);
    }

    function updateOperatorLevel(address operatorAddr) onlyOwner {
        operators[operatorAddr] = true;
        OperatorUpdated(operatorAddr);
    }

    function removeOperator(address operatorAddr) onlyOwner {
        delete operators[operatorAddr];
        OperatorRemoved(operatorAddr);
    }

    function checkOperator(address addr) view returns (bool) {
        return operators[addr];
    }
}