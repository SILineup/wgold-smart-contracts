// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Token", "TK") {
        _mint(msg.sender, 10000000e18);
    }

    function mint(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }
}
