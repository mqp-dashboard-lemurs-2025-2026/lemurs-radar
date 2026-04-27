import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import db_manager
from app.routers import alerts, clinicians, metrics, scores, students

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI()

# Open CORS keeps local demos simple. Tighten this if the backend is exposed directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # Open the database pool once before routes start handling requests.
    await db_manager.connect()


@app.on_event("shutdown")
async def shutdown_event():
    # Close the pool cleanly when the service stops.
    await db_manager.disconnect()


# Keep these paths unprefixed because the frontend calls them directly.
app.include_router(clinicians.router)
app.include_router(students.router)
app.include_router(alerts.router)
app.include_router(metrics.router)
app.include_router(scores.router)


if __name__ == "__main__":
    # Useful for quick local checks outside Docker.
    uvicorn.run(app, host="0.0.0.0", port=8000)
