from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from backend.core.cfg_generator import CFGGenerator, GrammarMode

router = APIRouter()

class KeyGenerationRequest(BaseModel):
    modes: List[str]  # List of modes: ["numeric", "alphabetic", "alphanumeric", "symbolic"]
    length: Optional[int] = None

class KeyGenerationResponse(BaseModel):
    key: str
    parse_steps: List[Dict]
    modes: List[str]

@router.post("/generate", response_model=KeyGenerationResponse)
async def generate_key(request: KeyGenerationRequest):
    """Generate a cryptographic key using CFG"""
    try:
        # Validate modes
        valid_modes = {"numeric", "alphabetic", "alphanumeric", "symbolic"}
        
        if not request.modes or len(request.modes) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one mode must be selected"
            )
        
        # Check all modes are valid
        invalid_modes = set(request.modes) - valid_modes
        if invalid_modes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid modes: {invalid_modes}. Must be one or more of: {list(valid_modes)}"
            )
        
        # Convert string modes to GrammarMode enum
        mode_map = {
            "numeric": GrammarMode.NUMERIC,
            "alphabetic": GrammarMode.ALPHABETIC,
            "alphanumeric": GrammarMode.ALPHANUMERIC,
            "symbolic": GrammarMode.SYMBOLIC
        }
        
        grammar_modes = [mode_map[mode.lower()] for mode in request.modes]
        generator = CFGGenerator(modes=grammar_modes)
        key, parse_steps = generator.generate_key(length=request.length)
        
        return KeyGenerationResponse(
            key=key,
            parse_steps=parse_steps,
            modes=request.modes
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/modes")
async def get_modes():
    """Get available grammar modes"""
    return {
        "modes": [
            {"id": "numeric", "name": "Numeric", "description": "Numbers only (0-9)"},
            {"id": "alphabetic", "name": "Alphabetic", "description": "Letters only (a-z, A-Z)"},
            {"id": "alphanumeric", "name": "Alphanumeric", "description": "Letters and numbers (a-z, A-Z, 0-9)"},
            {"id": "symbolic", "name": "Symbolic", "description": "Special characters only"}
        ]
    }
