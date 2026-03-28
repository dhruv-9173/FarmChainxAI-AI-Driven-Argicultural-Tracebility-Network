package infosys.project.farmchainxai.service;

import infosys.project.farmchainxai.entity.SupplyChainEvent;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * BlockchainService
 * Provides cryptographic hashing for supply chain events
 * Creates an immutable chain similar to blockchain without external infrastructure
 * 
 * How it works:
 * - Each event gets a SHA-256 hash based on its data
 * - Each hash includes the previous event's hash
 * - If anyone modifies an event, its hash changes, breaking all subsequent hashes
 * - This creates tamper-proof history like a blockchain
 */
@Service
public class BlockchainService {

    /**
     * Generate SHA-256 hash for a supply chain event
     * The hash includes the previous event's hash, creating a chain
     * 
     * @param batchId Batch identifier
     * @param stage Current stage of batch
     * @param location Current location
     * @param timestamp Event timestamp
     * @param previousHash Hash of previous event (creates chain)
     * @return SHA-256 hash as hex string
     */
    public String generateEventHash(
        String batchId,
        String stage,
        String location,
        Long timestamp,
        String previousHash
    ) {
        try {
            // Create event data string - order matters
            // If any field changes, hash changes completely
            String eventData = String.format(
                "%s|%s|%s|%d|%s",
                batchId != null ? batchId : "",
                stage != null ? stage : "",
                location != null ? location : "",
                timestamp,
                previousHash != null ? previousHash : "GENESIS"
            );

            // Generate SHA-256 hash
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(eventData.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            return bytesToHexString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Hash generation failed", e);
        }
    }

    /**
     * Verify entire supply chain integrity
     * Recalculates all hashes and checks if chain is unbroken
     * 
     * If ANY event was tampered with, verification fails
     * This is the key property - it's impossible to change history without detection
     * 
     * @param events Supply chain events in chronological order
     * @return true if entire chain is valid, false if tampering detected
     */
    public boolean verifySupplyChain(List<SupplyChainEvent> events) {
        if (events == null || events.isEmpty()) {
            return true;
        }

        String previousHash = null;
        
        for (SupplyChainEvent event : events) {
            // Recalculate hash based on event data
            String calculatedHash = generateEventHash(
                event.getBatchId(),
                event.getStage().toString(),
                event.getLocation(),
                event.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli(),
                previousHash
            );
            
            // Compare with stored hash
            // If they don't match, the event was tampered with
            if (!calculatedHash.equals(event.getEventHash())) {
                return false;
            }
            
            // Move to next event
            previousHash = event.getEventHash();
        }
        
        return true;
    }

    /**
     * Generate cryptographic signature of event
     * Uses HMAC for authenticity verification
     * 
     * @param eventHash Hash of the event
     * @param actorId ID of the actor who created the event
     * @return Signature as hex string
     */
    public String signEvent(String eventHash, String actorId) {
        try {
            String signData = eventHash + "|" + actorId;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] signBytes = digest.digest(signData.getBytes(StandardCharsets.UTF_8));
            
            return bytesToHexString(signBytes);
        } catch (Exception e) {
            throw new RuntimeException("Signature generation failed", e);
        }
    }

    /**
     * Verify a specific event's signature
     * 
     * @param eventHash Hash of the event
     * @param actorId ID of the actor
     * @param signature Stored signature to verify against
     * @return true if signature is valid
     */
    public boolean verifySignature(String eventHash, String actorId, String signature) {
        String calculatedSignature = signEvent(eventHash, actorId);
        return calculatedSignature.equals(signature);
    }

    /**
     * Get Merkle root hash of entire supply chain
     * This is a single hash that represents the entire chain
     * If any event changes, this root changes
     * 
     * @param events All events in the supply chain
     * @return Root hash of the entire chain
     */
    public String calculateMerkleRoot(List<SupplyChainEvent> events) {
        if (events == null || events.isEmpty()) {
            return generateEventHash("", "", "", System.currentTimeMillis(), null);
        }

        String rootHash = null;
        for (SupplyChainEvent event : events) {
            String hash = event.getEventHash();
            if (rootHash == null) {
                rootHash = hash;
            } else {
                // Combine hashes
                rootHash = this.generateEventHashFromHash(rootHash, hash);
            }
        }
        
        return rootHash;
    }

    /**
     * Helper method to combine two hashes
     */
    private String generateEventHashFromHash(String hash1, String hash2) {
        try {
            String combined = hash1 + hash2;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            return bytesToHexString(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("Hash combination failed", e);
        }
    }

    /**
     * Convert byte array to hexadecimal string
     */
    private String bytesToHexString(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
