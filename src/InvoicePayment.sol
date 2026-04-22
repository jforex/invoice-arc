// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InvoicePayment
 * @notice Invoice payment system on Arc using USDC as native gas
 */
contract InvoicePayment {
    
    // USDC address on Arc (native gas token with ERC-20 interface)
    address public constant USDC = 0x3600000000000000000000000000000000000000;
    
    address public platformOwner;
    uint256 public platformFeePercent = 150; // 1.5% in basis points
    
    mapping(string => bool) public invoicesPaid;
    mapping(string => uint256) public invoiceAmounts;
    
    bool public paused;
    
    event InvoicePaid(
        string indexed invoiceId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 platformFee,
        uint256 businessReceived,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    error ZeroAmount();
    error InvalidRecipient();
    error InvoiceAlreadyPaid(string invoiceId);
    error TransferFailed();
    error Unauthorized();
    error FeeTooHigh();
    error ContractPaused();
    
    modifier onlyOwner() {
        if (msg.sender != platformOwner) revert Unauthorized();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    /**
     * @notice Pay an invoice with USDC
     * @param invoiceId Unique invoice identifier
     * @param recipient Business wallet address
     * @param amount Total payment amount in USDC (6 decimals)
     */
    function payInvoice(
        string calldata invoiceId,
        address recipient,
        uint256 amount
    ) external whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert InvalidRecipient();
        if (invoicesPaid[invoiceId]) revert InvoiceAlreadyPaid(invoiceId);
        
        uint256 platformFee = (amount * platformFeePercent) / 10000;
        uint256 businessAmount = amount - platformFee;
        
        invoicesPaid[invoiceId] = true;
        invoiceAmounts[invoiceId] = amount;
        
        // Transfer to business
        (bool success1, ) = USDC.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                recipient,
                businessAmount
            )
        );
        if (!success1) revert TransferFailed();
        
        // Transfer platform fee
        if (platformFee > 0) {
            (bool success2, ) = USDC.call(
                abi.encodeWithSignature(
                    "transferFrom(address,address,uint256)",
                    msg.sender,
                    platformOwner,
                    platformFee
                )
            );
            if (!success2) revert TransferFailed();
        }
        
        emit InvoicePaid(
            invoiceId,
            msg.sender,
            recipient,
            amount,
            platformFee,
            businessAmount,
            block.timestamp
        );
    }
    
    function isInvoicePaid(string calldata invoiceId) 
        external 
        view 
        returns (bool) 
    {
        return invoicesPaid[invoiceId];
    }
    
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        if (newFeePercent > 1000) revert FeeTooHigh(); // Max 10%
        
        uint256 oldFee = platformFeePercent;
        platformFeePercent = newFeePercent;
        
        emit PlatformFeeUpdated(oldFee, newFeePercent);
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
}