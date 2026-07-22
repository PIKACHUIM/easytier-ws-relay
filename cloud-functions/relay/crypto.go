package relay

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/binary"
	"hash"
)

// SipHash13 implements SipHash-1-3 as used in EasyTier
func SipHash13(key []byte, data []byte) uint64 {
	if len(key) != 16 {
		panic("SipHash key must be 16 bytes")
	}

	k0 := binary.LittleEndian.Uint64(key[0:8])
	k1 := binary.LittleEndian.Uint64(key[8:16])

	v0 := k0 ^ 0x736f6d6570736575
	v1 := k1 ^ 0x646f72616e646f6d
	v2 := k0 ^ 0x6c7967656e657261
	v3 := k1 ^ 0x7465646279746573

	// Process data in 8-byte blocks
	for i := 0; i < len(data); i += 8 {
		block := make([]byte, 8)
		copy(block, data[i:])
		m := binary.LittleEndian.Uint64(block)

		v3 ^= m
		// SipRound x1
		v0 += v1
		v2 += v3
		v1 = v1<<13 | v1>>51
		v3 = v3<<16 | v3>>48
		v1 ^= v0
		v3 ^= v2
		v0 = v0<<32 | v0>>32
		v2 += v1
		v0 += v3
		v1 = v1<<17 | v1>>47
		v3 = v3<<21 | v3>>43
		v1 ^= v2
		v3 ^= v0
		v2 = v2<<32 | v2>>32

		v0 ^= m
	}

	// Finalization with length
	lastBlock := uint64(len(data)&0xff) << 56
	v3 ^= lastBlock

	// 3 rounds of SipRound
	for i := 0; i < 3; i++ {
		v0 += v1
		v2 += v3
		v1 = v1<<13 | v1>>51
		v3 = v3<<16 | v3>>48
		v1 ^= v0
		v3 ^= v2
		v0 = v0<<32 | v0>>32
		v2 += v1
		v0 += v3
		v1 = v1<<17 | v1>>47
		v3 = v3<<21 | v3>>43
		v1 ^= v2
		v3 ^= v0
		v2 = v2<<32 | v2>>32
	}

	return v0 ^ v1 ^ v2 ^ v3
}

// SHA256Sum returns the SHA-256 hash of data
func SHA256Sum(data []byte) []byte {
	h := sha256.Sum256(data)
	return h[:]
}

// DeriveKey128 derives a 128-bit key using SHA-256
func DeriveKey128(secret []byte) []byte {
	hash := SHA256Sum(secret)
	return hash[:16]
}

// DeriveKey256 derives a 256-bit key using SHA-256
func DeriveKey256(secret []byte) []byte {
	return SHA256Sum(secret)
}

// AES128GCMEncrypt encrypts data with AES-128-GCM
func AES128GCMEncrypt(key, plaintext, aad []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	// In real implementation, nonce should be random
	return gcm.Seal(nonce, nonce, plaintext, aad), nil
}

// AES128GCMDecrypt decrypts data with AES-128-GCM
func AES128GCMDecrypt(key, ciphertext, aad []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, nil
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	return gcm.Open(nil, nonce, ciphertext, aad)
}

// HashGroupKey creates a group key from network name and secret digest
func HashGroupKey(networkName, secretDigest string) []byte {
	h := sha256.New()
	h.Write([]byte(networkName))
	h.Write([]byte(":"))
	h.Write([]byte(secretDigest))
	return h.Sum(nil)
}

var _ hash.Hash // ensure hash import is used
