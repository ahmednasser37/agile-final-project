from dataclasses import dataclass
from typing import List, Optional, Dict
from datetime import datetime

@dataclass
class NormalizedActivity:
    id: str # The internal task_id
    activity_code: str # task_code
    name: str
    status: str
    target_start: Optional[datetime]
    target_end: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    duration: Optional[float]
    percent_complete: Optional[float]

@dataclass
class NormalizedRelationship:
    pred_id: str
    succ_id: str
    type: str

@dataclass
class NormalizedSchedule:
    project_id: str
    project_name: str
    data_date: Optional[datetime]
    activities: Dict[str, NormalizedActivity]
    relationships: List[NormalizedRelationship]
