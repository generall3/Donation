//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Donation is Ownable {
    address[] private donators; // List of those, who made donations
    uint private totalBalance;
    mapping (address => uint) private donations; // Stores the donation value for each donator address

    event DonationReceived(address indexed donator, uint value);

    function getDonators() public view returns (address[] memory) {
        return donators;
    }

    function getBalance() public view returns(uint) {
        return totalBalance;
    }

    function getDonationValue(address _donator) public view returns (uint) {
        return donations[_donator];
    }

    receive() external payable {
        require(msg.value > 0, "Donation value is equal to zero");

        if (donations[msg.sender] == 0) {
            donators.push(msg.sender);
        }

        donations[msg.sender] += msg.value;
        totalBalance += msg.value;

        emit DonationReceived(msg.sender, msg.value);
    }

    function withdraw(address payable _to, uint _balance) external onlyOwner {
        require(_balance <= address(this).balance, "Withdrawal value is greater than total balance");
        _to.transfer(_balance);
        totalBalance -= _balance;
    }
}
