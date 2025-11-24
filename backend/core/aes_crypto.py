from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from typing import Dict
import os
import base64

def derive_key_from_string(key_string: str, key_length: int = 32) -> bytes:
    """
    Derive a fixed-length key from a string
    Uses SHA-256 hashing to ensure consistent key length
    """
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    
    # Use PBKDF2 to derive a key
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=key_length,
        salt=b'crypto_key_salt',  # In production, use random salt
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(key_string.encode('utf-8'))
    return key

def encrypt_text(plaintext: str, key_string: str) -> Dict[str, str]:
    """
    Encrypt plaintext using AES-GCM
    Returns: {"encrypted": base64_encoded_ciphertext, "nonce": base64_encoded_nonce}
    """
    key = derive_key_from_string(key_string)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    
    return {
        "encrypted": base64.b64encode(ciphertext).decode('utf-8'),
        "nonce": base64.b64encode(nonce).decode('utf-8')
    }

def decrypt_text(encrypted_data: Dict[str, str], key_string: str) -> str:
    """
    Decrypt ciphertext using AES-GCM
    """
    key = derive_key_from_string(key_string)
    aesgcm = AESGCM(key)
    
    ciphertext = base64.b64decode(encrypted_data["encrypted"])
    nonce = base64.b64decode(encrypted_data["nonce"])
    
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode('utf-8')

