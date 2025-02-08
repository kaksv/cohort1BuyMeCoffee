// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BuyMeACoffee {
        event NewMemo(address indexed from, uint256 timestamp, string name, string message);

    struct Memos {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    address payable owner;
    Memos[] memos;

    constructor () {
        owner = payable(msg.sender);
    }

    function fetchMemoDetails() public view returns (Memos[] memory) {
        return memos;
    }


    //buy coffee function
    function buyCoffees(string memory _name, string memory _message) public payable {
        require(msg.value >= 0.001 ether, "You must tip at least 0.001 ETH");
        memos.push(Memos(msg.sender, block.timestamp, _name, _message));
        
    }
    //withdraw function 
   function withdrawTips() public {
    require(owner.send(address(this).balance));
   }

}

// BuyMeACoffee - 0x09Bcca8E9fCD2133fAf1C76e38415EF424f55AA4
