from dataclasses import dataclass
from typing import Dict, List, Any
from app.models import NormalizedSchedule, NormalizedActivity

@dataclass
class ActivityVariance:
    activity_id: str
    activity_code: str
    name: str
    status: str # added, deleted, changed, unchanged

    # Values as tuples: (baseline_val, updated_val)
    start_variance: tuple[Any, Any] | None = None
    end_variance: tuple[Any, Any] | None = None
    status_variance: tuple[str, str] | None = None
    duration_variance: tuple[float, float] | None = None

@dataclass
class ScheduleComparison:
    baseline_date: Any
    updated_date: Any
    added_activities: int
    deleted_activities: int
    changed_activities: int
    variances: List[ActivityVariance]

def compare_schedules(baseline: NormalizedSchedule, updated: NormalizedSchedule) -> ScheduleComparison:
    variances = []

    baseline_acts = baseline.activities
    updated_acts = updated.activities

    added_count = 0
    deleted_count = 0
    changed_count = 0

    # Find deleted and changed activities
    for act_id, base_act in baseline_acts.items():
        if act_id not in updated_acts:
            deleted_count += 1
            variances.append(ActivityVariance(
                activity_id=act_id,
                activity_code=base_act.activity_code,
                name=base_act.name,
                status="deleted"
            ))
        else:
            upd_act = updated_acts[act_id]

            # Check for changes
            has_changes = False
            var = ActivityVariance(
                activity_id=act_id,
                activity_code=upd_act.activity_code,
                name=upd_act.name,
                status="changed"
            )

            # Compare dates (prefer actuals if started, otherwise targets)
            base_start = base_act.actual_start or base_act.target_start
            upd_start = upd_act.actual_start or upd_act.target_start
            if base_start != upd_start:
                var.start_variance = (base_start, upd_start)
                has_changes = True

            base_end = base_act.actual_end or base_act.target_end
            upd_end = upd_act.actual_end or upd_act.target_end
            if base_end != upd_end:
                var.end_variance = (base_end, upd_end)
                has_changes = True

            if base_act.status != upd_act.status:
                var.status_variance = (base_act.status, upd_act.status)
                has_changes = True

            if has_changes:
                changed_count += 1
                variances.append(var)
            else:
                var.status = "unchanged"
                # You might want to include unchanged for full reports, but maybe skip for summary

    # Find added activities
    for act_id, upd_act in updated_acts.items():
        if act_id not in baseline_acts:
            added_count += 1
            variances.append(ActivityVariance(
                activity_id=act_id,
                activity_code=upd_act.activity_code,
                name=upd_act.name,
                status="added"
            ))

    return ScheduleComparison(
        baseline_date=baseline.data_date,
        updated_date=updated.data_date,
        added_activities=added_count,
        deleted_activities=deleted_count,
        changed_activities=changed_count,
        variances=variances
    )
