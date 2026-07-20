from fastapi import FastAPI, HTTPException

from . import __version__
from .helpers import factorial

app = FastAPI(title="aifactory-demo", version=__version__)


@app.get("/")
async def root() -> dict[str, str]:
    return {"app": "aifactory-demo"}


@app.get("/factorial/{n}")
async def get_factorial(n: int) -> dict[str, int]:
    """Calculate the factorial of n."""
    try:
        result = factorial(n)
        return {"factorial": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
