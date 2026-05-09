import logging
from datetime import datetime
from xerparser.reader import Reader
from app.models import NormalizedSchedule, NormalizedActivity, NormalizedRelationship

logger = logging.getLogger(__name__)

def parse_date(date_str: str) -> datetime | None:
    if not date_str or not str(date_str).strip():
        return None
    try:
        # pyp6xer typically returns datetime objects directly or strings.
        if isinstance(date_str, datetime):
            return date_str
        return datetime.strptime(date_str.strip(), "%Y-%m-%d %H:%M")
    except ValueError:
        return None

def parse_xer_file(filepath: str) -> NormalizedSchedule:
    xer = Reader(filepath)

    projects = list(xer.projects)
    if not projects:
        raise ValueError("No projects found in XER file")

    # Auto-select the first project
    project = projects[0]

    data_date = parse_date(project.last_recalc_date)

    activities = {}
    for task in xer.activities:
        act = NormalizedActivity(
            id=str(task.task_id),
            activity_code=task.task_code,
            name=task.task_name,
            status=task.status_code,
            target_start=parse_date(task.target_start_date),
            target_end=parse_date(task.target_end_date),
            actual_start=parse_date(task.act_start_date),
            actual_end=parse_date(task.act_end_date),
            duration=None, # Calculate if necessary
            percent_complete=float(task.phys_complete_pct) if hasattr(task, 'phys_complete_pct') and task.phys_complete_pct else 0.0
        )
        activities[str(task.task_id)] = act

    relationships = []
    if hasattr(xer, 'relations') and xer.relations:
        for rel in xer.relations:
            relationships.append(NormalizedRelationship(
                pred_id=str(rel.pred_task_id),
                succ_id=str(rel.task_id),
                type=rel.pred_type
            ))

    return NormalizedSchedule(
        project_id=str(project.proj_short_name),
        project_name=str(project.proj_short_name),
        data_date=data_date,
        activities=activities,
        relationships=relationships
    )
