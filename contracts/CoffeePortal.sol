// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CoffeePortal{

    uint256 totalCoffee;
    address payable public owner;


    event NewCoffee(address indexed from, uint256 timestamp, string message, string name);
    
    constructor() payable{
        console.log("Hey, I'm here!");
        owner = payable(msg.sender);
    }

    //Object structure
    struct Coffee{
        address giver;
        string message;
        string name;
        uint256 payAmount;
        uint256 timestamp;
    }

    //Using this array we can store all coffee sent
    Coffee[] coffee;

    function getAllCoffee() public view returns(Coffee[] memory){
        return coffee;
    }

    function getTotalCoffee() public view returns(uint256){
        console.log('Total coffee sent: ',totalCoffee);
        return totalCoffee;
    }

    function buyCoffee(string memory _message, string memory _name, uint256 _payAmount) public payable {
        uint256 cost = 0.001 ether;
        require(
            msg.value >= cost,
            "Insuficient amount for a minimum selected."
        );

        require(
            _payAmount == msg.value,
            "Distinct amounts were sent."
        );

        totalCoffee +=1;
        console.log("Payable MSG: %s", msg.value);

        console.log("PayAmount value: %d", _payAmount);

        console.log("%s just sent a cofee", msg.sender);

        coffee.push(Coffee(msg.sender, _message, _name, msg.value, block.timestamp));

        (bool success, ) = owner.call{value: msg.value}("");
        require(
            success,
            "Failed to send amount"
            );

        emit NewCoffee(msg.sender, block.timestamp, _message, _name);

    }
  
}



