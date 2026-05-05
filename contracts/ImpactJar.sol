// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title ImpactJar
/// @notice Simple Celo mainnet contract for MiniPay-friendly stablecoin micro-donation jars.
contract ImpactJar {
    struct Campaign {
        string name;
        string description;
        address recipient;
        bool active;
        uint256 totalRaised;
    }

    address public owner;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => mapping(address => uint256)) public raisedByToken;

    event CampaignCreated(uint256 indexed campaignId, string name, address indexed recipient);
    event CampaignStatusChanged(uint256 indexed campaignId, bool active);
    event TokenSupportChanged(address indexed token, bool supported);
    event Donated(
        uint256 indexed campaignId,
        address indexed donor,
        address indexed token,
        uint256 amount,
        string note
    );
    event Withdrawn(uint256 indexed campaignId, address indexed token, address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(address initialToken) {
        owner = msg.sender;
        if (initialToken != address(0)) {
            supportedTokens[initialToken] = true;
            emit TokenSupportChanged(initialToken, true);
        }
    }

    function createCampaign(
        string calldata name,
        string calldata description,
        address recipient
    ) external onlyOwner returns (uint256 campaignId) {
        require(bytes(name).length > 0, "EMPTY_NAME");
        require(recipient != address(0), "BAD_RECIPIENT");

        campaignId = campaignCount++;
        campaigns[campaignId] = Campaign({
            name: name,
            description: description,
            recipient: recipient,
            active: true,
            totalRaised: 0
        });

        emit CampaignCreated(campaignId, name, recipient);
    }

    function setCampaignActive(uint256 campaignId, bool active) external onlyOwner {
        require(campaignId < campaignCount, "BAD_CAMPAIGN");
        campaigns[campaignId].active = active;
        emit CampaignStatusChanged(campaignId, active);
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        require(token != address(0), "BAD_TOKEN");
        supportedTokens[token] = supported;
        emit TokenSupportChanged(token, supported);
    }

    function donate(uint256 campaignId, address token, uint256 amount, string calldata note) external {
        require(campaignId < campaignCount, "BAD_CAMPAIGN");
        require(campaigns[campaignId].active, "INACTIVE_CAMPAIGN");
        require(supportedTokens[token], "TOKEN_NOT_SUPPORTED");
        require(amount > 0, "ZERO_AMOUNT");

        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "TRANSFER_FROM_FAILED");

        campaigns[campaignId].totalRaised += amount;
        raisedByToken[campaignId][token] += amount;

        emit Donated(campaignId, msg.sender, token, amount, note);
    }

    function withdraw(uint256 campaignId, address token, uint256 amount) external {
        require(campaignId < campaignCount, "BAD_CAMPAIGN");
        Campaign memory campaign = campaigns[campaignId];
        require(msg.sender == owner || msg.sender == campaign.recipient, "NOT_ALLOWED");
        require(amount > 0 && amount <= raisedByToken[campaignId][token], "BAD_AMOUNT");

        raisedByToken[campaignId][token] -= amount;
        bool ok = IERC20(token).transfer(campaign.recipient, amount);
        require(ok, "TRANSFER_FAILED");

        emit Withdrawn(campaignId, token, campaign.recipient, amount);
    }
}
