// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./openzeppelin/SafeERC20Upgradeable.sol";
import "./openzeppelin/utils/Initializable.sol";
import "./interfaces/IPayment.sol";
import "./openzeppelin/PausableUpgradeable.sol";
import "./openzeppelin/AccessControlUpgradeable.sol";

contract Payment is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    IPayment
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    /**
     * @notice Address, that will be used to buy tokens on CEX.
     */
    address public cexAddress;

    event PaymentProcessed(
        uint256 indexed paymentId,
        uint256 indexed orderId,
        address indexed from,
        address to
    );
    event ChangeCexAddress(address _cexAddress);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _cexAddress) public initializer {
        __Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        cexAddress = _cexAddress;
    }

    /**
     * @dev Retrieve tokens from user to proceed with next step on WGoldManager.
     *
     * @param paymentInfo A struct, that was created on a backend.
     */
    function processPayment(PaymentInfo memory paymentInfo)
        external
        override
        whenNotPaused
    {
        require(
            IERC20Upgradeable(paymentInfo.assetAddress).allowance(
                msg.sender,
                address(this)
            ) >= paymentInfo.amount,
            "Payment: not enough allowance"
        );
        require(
            paymentInfo.withdrawAmount < paymentInfo.amount,
            "Withdraw more than amount"
        );
        IERC20Upgradeable(paymentInfo.assetAddress).safeTransferFrom(
            msg.sender,
            paymentInfo.to,
            paymentInfo.amount
        );
        IERC20Upgradeable(paymentInfo.assetAddress).safeTransfer(
            cexAddress,
            paymentInfo.withdrawAmount
        );
        emit PaymentProcessed(
            paymentInfo.paymentId,
            paymentInfo.orderId,
            paymentInfo.from,
            paymentInfo.to
        );
    }

    /**
     * @dev Change address, that will be used to buy tokens on CEX.
     *
     * @param _cexAddress Address for new CEX wallet.
     */
    function changeCexAddress(address _cexAddress)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_cexAddress != address(0), "Zero address");
        cexAddress = _cexAddress;
        emit ChangeCexAddress(_cexAddress);
    }
}
