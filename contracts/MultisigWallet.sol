// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title A Multi-signature Wallet
/// @notice This contract allows multiple owners to manage a shared wallet
/// @dev Ensures that transactions require approval from multiple owners
contract MultisigWallet {
    address[] public owners;
    uint public requiredSignatures;

    mapping(address => bool) public isOwner;
    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;
    uint public transactionCount;

    struct Transaction {
        address destination;
        uint value;
        bool executed;
    }

    event Deposit(address indexed sender, uint amount);
    event SubmitTransaction(address indexed owner, uint indexed txIndex);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier transactionExists(uint txIndex) {
        require(txIndex < transactionCount, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint txIndex) {
        require(!transactions[txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint txIndex) {
        require(!confirmations[txIndex][msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _requiredSignatures) {
        require(_owners.length > 0, "Owners required");
        require(_requiredSignatures > 0 && _requiredSignatures <= _owners.length, "Invalid required signatures");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner address");
            require(!isOwner[owner], "Duplicate owner");

            isOwner[owner] = true;
            owners.push(owner);
        }
        requiredSignatures = _requiredSignatures;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(address destination, uint value) external onlyOwner {
        uint txIndex = transactionCount;
        transactions[txIndex] = Transaction({
            destination: destination,
            value: value,
            executed: false
        });
        transactionCount++;
        emit SubmitTransaction(msg.sender, txIndex);
    }

    function confirmTransaction(uint txIndex) external onlyOwner transactionExists(txIndex) notConfirmed(txIndex) {
        confirmations[txIndex][msg.sender] = true;
        emit ConfirmTransaction(msg.sender, txIndex);
    }

    function executeTransaction(uint txIndex) external onlyOwner transactionExists(txIndex) notExecuted(txIndex) {
        require(isConfirmed(txIndex), "Not enough confirmations");

        Transaction storage txn = transactions[txIndex];
        txn.executed = true;
        (bool success, ) = txn.destination.call{value: txn.value}("");
        require(success, "Transaction failed");

        emit ExecuteTransaction(msg.sender, txIndex);
    }

    function revokeConfirmation(uint txIndex) external onlyOwner transactionExists(txIndex) {
        require(confirmations[txIndex][msg.sender], "Transaction not confirmed");

        confirmations[txIndex][msg.sender] = false;
        emit RevokeConfirmation(msg.sender, txIndex);
    }

    function isConfirmed(uint txIndex) public view returns (bool) {
        uint count = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[txIndex][owners[i]]) {
                count++;
            }
        }
        return count >= requiredSignatures;
    }
}
