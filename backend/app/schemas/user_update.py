from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserUpdate(BaseModel):
    clinician: Optional[str] = None
    next_seen: Optional[datetime] = None
    notes: Optional[str] = None
