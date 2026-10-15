// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Academic registry: verification is an attestation by an authorized registrar.
/// @dev No payment custody. All metadata and document hashes are public.
contract LandRegistry {
    address public immutable admin;
    mapping(address => bool) public registrars;
    uint256 public landCount;
    enum Status { Pending, Verified, Rejected }
    struct Land {
        uint256 id;
        string parcel;
        string location;
        uint256 area;
        string category;
        bytes32 documentHash;
        address owner;
        Status status;
        bool disputed;
        address proposedBuyer;
        bool buyerAccepted;
    }
    mapping(uint256 => Land) private lands;
    mapping(bytes32 => bool) public parcelExists;
    event Registered(uint256 indexed id, address indexed owner, string parcel);
    event Reviewed(uint256 indexed id, address indexed registrar, bool approved, string reason);
    event TransferProposed(uint256 indexed id, address indexed owner, address indexed buyer);
    event TransferAccepted(uint256 indexed id, address indexed buyer);
    event TransferCancelled(uint256 indexed id, address indexed actor);
    event OwnershipTransferred(uint256 indexed id, address indexed previousOwner, address indexed newOwner);
    event DisputeChanged(uint256 indexed id, bool disputed, string reason);
    event RegistrarChanged(address indexed account, bool enabled);
    constructor() { admin = msg.sender; registrars[msg.sender] = true; }
    modifier onlyRegistrar() { require(registrars[msg.sender], "Registrar only"); _; }
    modifier existing(uint256 id) { require(id > 0 && id <= landCount, "Land not found"); _; }
    function setRegistrar(address account, bool enabled) external {
        require(msg.sender == admin, "Admin only");
        require(account != address(0), "Zero address");
        require(account != admin || enabled, "Admin must remain registrar");
        registrars[account] = enabled;
        emit RegistrarChanged(account, enabled);
    }
    function register(string calldata parcel, string calldata location, uint256 area, string calldata category, bytes32 documentHash) external {
        bytes memory p = bytes(parcel);
        require(p.length >= 3 && p.length <= 64, "Parcel length 3-64");
        for (uint256 i; i < p.length; i++) {
            bytes1 c = p[i];
            require((c >= 0x41 && c <= 0x5a) || (c >= 0x30 && c <= 0x39) || c == 0x2d, "Use uppercase parcel code");
        }
        bytes32 key = keccak256(p);
        require(!parcelExists[key], "Parcel already registered");
        require(bytes(location).length > 0 && bytes(location).length <= 160, "Invalid location");
        require(area > 0 && area <= 1000000000, "Invalid area");
        require(bytes(category).length > 0 && bytes(category).length <= 40, "Invalid category");
        require(documentHash != bytes32(0), "Document hash required");
        parcelExists[key] = true;
        uint256 id = ++landCount;
        lands[id] = Land(id, parcel, location, area, category, documentHash, msg.sender, Status.Pending, false, address(0), false);
        emit Registered(id, msg.sender, parcel);
    }
    function getLand(uint256 id) external view existing(id) returns (Land memory) { return lands[id]; }
    function review(uint256 id, bool approved, string calldata reason) external onlyRegistrar existing(id) {
        Land storage land = lands[id];
        require(land.owner != msg.sender, "Cannot review own land");
        require(land.status == Status.Pending, "Already reviewed");
        require(bytes(reason).length > 0 && bytes(reason).length <= 240, "Reason required (max 240)");
        land.status = approved ? Status.Verified : Status.Rejected;
        emit Reviewed(id, msg.sender, approved, reason);
    }
    function setDispute(uint256 id, bool disputed, string calldata reason) external onlyRegistrar existing(id) {
        Land storage land = lands[id];
        require(land.owner != msg.sender, "Cannot adjudicate own land");
        require(land.disputed != disputed, "No change");
        require(bytes(reason).length > 0 && bytes(reason).length <= 240, "Reason required (max 240)");
        land.disputed = disputed;
        if (disputed && land.proposedBuyer != address(0)) {
            land.proposedBuyer = address(0); land.buyerAccepted = false;
            emit TransferCancelled(id, msg.sender);
        }
        emit DisputeChanged(id, disputed, reason);
    }
    function proposeTransfer(uint256 id, address buyer) external existing(id) {
        Land storage land = lands[id];
        require(msg.sender == land.owner, "Owner only");
        require(land.status == Status.Verified && !land.disputed, "Land not transferable");
        require(land.proposedBuyer == address(0), "Transfer already pending");
        require(buyer != address(0) && buyer != land.owner, "Invalid buyer");
        land.proposedBuyer = buyer; land.buyerAccepted = false;
        emit TransferProposed(id, msg.sender, buyer);
    }
    function acceptTransfer(uint256 id) external existing(id) {
        Land storage land = lands[id];
        require(msg.sender == land.proposedBuyer, "Buyer only");
        require(!land.disputed && land.status == Status.Verified, "Land not transferable");
        require(!land.buyerAccepted, "Already accepted");
        land.buyerAccepted = true;
        emit TransferAccepted(id, msg.sender);
    }
    function cancelTransfer(uint256 id) external existing(id) {
        Land storage land = lands[id];
        require(land.proposedBuyer != address(0), "No transfer");
        require(msg.sender == land.owner || msg.sender == land.proposedBuyer, "Party only");
        land.proposedBuyer = address(0); land.buyerAccepted = false;
        emit TransferCancelled(id, msg.sender);
    }
    function finalizeTransfer(uint256 id) external onlyRegistrar existing(id) {
        Land storage land = lands[id];
        require(msg.sender != land.owner && msg.sender != land.proposedBuyer, "Independent registrar required");
        require(land.status == Status.Verified && !land.disputed, "Land not transferable");
        require(land.proposedBuyer != address(0) && land.buyerAccepted, "Buyer consent required");
        address previous = land.owner;
        land.owner = land.proposedBuyer; land.proposedBuyer = address(0); land.buyerAccepted = false;
        emit OwnershipTransferred(id, previous, land.owner);
    }
}
