from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import cfg, entropy, aes
import os

app = FastAPI(
    title="Cryptographic Key Generation API",
    description="Grammar-based cryptographic key generation system",
    version="1.0.0"
)

origins = [
    "https://key-generation-4umn.vercel.app",
    "http://localhost:5173",   # keep for local dev if you use Vite
]




# Preferred: get allowed origin from environment so you don't hardcode it
# FRONTEND_ORIGIN = os.environ.get("FRONTEND_URL", "https://key-generation-4umn.vercel.app")

# # If you have multiple frontends, use a list:
# origins = [FRONTEND_ORIGIN]

# # For quick testing you can temporarily allow all origins:
# # origins = ["*"]   # <-- use only for debugging, not production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # or ["*"] for debug
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(cfg.router, prefix="/api/cfg", tags=["CFG"])
app.include_router(entropy.router, prefix="/api/entropy", tags=["Entropy"])
app.include_router(aes.router, prefix="/api/aes", tags=["AES"])

@app.get("/")
async def root():
    return {"message": "Cryptographic Key Generation API"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

