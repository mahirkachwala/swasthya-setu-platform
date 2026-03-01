// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VialLedger {
    struct ViolationRecord {
        bytes32 eventHash;
        string eventType;
        uint256 timestamp;
        uint256 blockTs;
    }

    mapping(string => ViolationRecord[]) private shipmentViolations;

    event ViolationRecorded(
        string indexed shipmentId,
        bytes32 eventHash,
        string eventType,
        uint256 timestamp
    );

    function recordViolation(
        string calldata shipmentId,
        bytes32 eventHash,
        string calldata eventType,
        uint256 timestamp
    ) external {
        shipmentViolations[shipmentId].push(ViolationRecord({
            eventHash: eventHash,
            eventType: eventType,
            timestamp: timestamp,
            blockTs: block.timestamp
        }));

        emit ViolationRecorded(shipmentId, eventHash, eventType, timestamp);
    }

    function getViolationCount(string calldata shipmentId) external view returns (uint256) {
        return shipmentViolations[shipmentId].length;
    }

    function getViolation(string calldata shipmentId, uint256 index) external view returns (
        bytes32 eventHash,
        string memory eventType,
        uint256 timestamp,
        uint256 blockTs
    ) {
        ViolationRecord storage v = shipmentViolations[shipmentId][index];
        return (v.eventHash, v.eventType, v.timestamp, v.blockTs);
    }
}
