from fastapi import APIRouter
from pydantic import BaseModel
from backend.core.entropy import calculate_shannon_entropy, get_entropy_color

router = APIRouter()

class EntropyRequest(BaseModel):
    text: str

class EntropyResponse(BaseModel):
    entropy: float
    color: str
    max_entropy: float = 8.0

@router.post("/calculate", response_model=EntropyResponse)
async def calculate_entropy(request: EntropyRequest):
    """Calculate Shannon entropy of a string"""
    entropy = calculate_shannon_entropy(request.text)
    color = get_entropy_color(entropy)
    
    return EntropyResponse(
        entropy=round(entropy, 4),
        color=color,
        max_entropy=8.0
    )

