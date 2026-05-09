import os
import pytest
from datetime import datetime
from app.parser import parse_xer_file, parse_date
from app.compare import compare_schedules

def test_parse_date():
    dt = parse_date("2023-01-01 08:00")
    assert dt is not None
    assert dt.year == 2023
    assert dt.month == 1
    assert dt.hour == 8

    assert parse_date(None) is None
    assert parse_date("   ") is None
    assert parse_date("invalid date") is None

    dt2 = parse_date(datetime(2023, 1, 1, 8, 0))
    assert dt2 is not None

def test_parse_xer_mock_files():
    baseline_path = os.path.join(os.path.dirname(__file__), "mock_baseline.xer")
    updated_path = os.path.join(os.path.dirname(__file__), "mock_updated.xer")

    base_sched = parse_xer_file(baseline_path)
    assert base_sched.project_name == "PROJ-01"
    assert len(base_sched.activities) == 2
    assert "1" in base_sched.activities
    assert base_sched.activities["1"].activity_code == "A1000"

    upd_sched = parse_xer_file(updated_path)
    assert upd_sched.project_name == "PROJ-01"
    assert len(upd_sched.activities) == 3
    assert "3" in upd_sched.activities

def test_compare_schedules():
    baseline_path = os.path.join(os.path.dirname(__file__), "mock_baseline.xer")
    updated_path = os.path.join(os.path.dirname(__file__), "mock_updated.xer")

    base_sched = parse_xer_file(baseline_path)
    upd_sched = parse_xer_file(updated_path)

    comp = compare_schedules(base_sched, upd_sched)

    assert comp.added_activities == 1
    assert comp.deleted_activities == 0
    assert comp.changed_activities == 2

    added_var = next(v for v in comp.variances if v.status == "added")
    assert added_var.activity_code == "A1020"

    changed_var_1 = next(v for v in comp.variances if v.activity_code == "A1000")
    assert changed_var_1.status_variance is not None
    assert changed_var_1.status_variance == ("TK_NotStart", "TK_Active")
