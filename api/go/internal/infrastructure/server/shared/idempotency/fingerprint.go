package idempotency

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
)

// Fingerprint hashes a decoded request payload so a key cannot be replayed
// with different data.
func Fingerprint(payload any) string {
	data, err := json.Marshal(payload)
	if err != nil {
		data = nil
	}

	sum := sha256.Sum256(data)

	return hex.EncodeToString(sum[:])
}
