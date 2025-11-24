from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.core.aes_crypto import encrypt_text, decrypt_text

router = APIRouter()

class EncryptRequest(BaseModel):
    plaintext: str
    key: str

class EncryptResponse(BaseModel):
    encrypted: str
    nonce: str

class DecryptRequest(BaseModel):
    encrypted: str
    nonce: str
    key: str

class DecryptResponse(BaseModel):
    plaintext: str

@router.post("/encrypt", response_model=EncryptResponse)
async def encrypt(request: EncryptRequest):
    """Encrypt text using AES-GCM"""
    try:
        result = encrypt_text(request.plaintext, request.key)
        return EncryptResponse(
            encrypted=result["encrypted"],
            nonce=result["nonce"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/decrypt", response_model=DecryptResponse)
async def decrypt(request: DecryptRequest):
    """Decrypt text using AES-GCM"""
    try:
        encrypted_data = {
            "encrypted": request.encrypted,
            "nonce": request.nonce
        }
        plaintext = decrypt_text(encrypted_data, request.key)
        return DecryptResponse(plaintext=plaintext)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")

