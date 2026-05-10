import os
from xerparser.reader import Reader

def create_mock_xer_content(baseline=True):
    content = """ERMNT	15.2	2020-01-01	00:00:00	admin	admin	admin	0
%T	PROJECT
%F	proj_id	proj_short_name	proj_name	last_recalc_date	obs_id	add_date	def_calendar_id	chng_date
"""
    if baseline:
        content += "%R	1	PROJ-01	Mock Project Baseline	2023-01-01 00:00	1	2023-01-01 00:00	1	2023-01-01 00:00\n"
    else:
        content += "%R	1	PROJ-01	Mock Project Updated	2023-02-01 00:00	1	2023-02-01 00:00	1	2023-02-01 00:00\n"

    # WBS fields
    wbs_f = "wbs_id proj_id obs_id seq_num est_wt proj_node_flag sum_data_flag status_code wbs_short_name wbs_name phase_id parent_wbs_id ev_user_pct ev_etc_user_value orig_cost indep_remain_total_cost ann_dscnt_rate_pct dscnt_period_type indep_remain_work_qty anticip_start_date anticip_end_date ev_compute_type ev_etc_compute_type guid tmpl_guid plan_open_state".split()
    wbs_r = ["1", "1", "1", "1", "1", "Y", "N", "Active", "WBS1", "Root WBS", "1", "", "0", "0", "0", "0", "0", "0", "0", "", "", "", "", "", "", ""]

    content += "%T\tPROJWBS\n"
    content += "%F\t" + "\t".join(wbs_f) + "\n"
    content += "%R\t" + "\t".join(wbs_r) + "\n"

    # TASK fields
    task_f = "task_id proj_id wbs_id task_code task_name status_code target_start_date target_end_date act_start_date act_end_date task_type phys_complete_pct clndr_id".split()
    content += "%T\tTASK\n"
    content += "%F\t" + "\t".join(task_f) + "\n"

    if baseline:
        task1 = ["1", "1", "1", "A1000", "Activity 1", "TK_NotStart", "2023-01-01 08:00", "2023-01-05 17:00", "", "", "TT_Task", "0", "1"]
        task2 = ["2", "1", "1", "A1010", "Activity 2", "TK_NotStart", "2023-01-06 08:00", "2023-01-10 17:00", "", "", "TT_Task", "0", "1"]
        content += "%R\t" + "\t".join(task1) + "\n"
        content += "%R\t" + "\t".join(task2) + "\n"
    else:
        task1 = ["1", "1", "1", "A1000", "Activity 1", "TK_Active", "2023-01-01 08:00", "2023-01-06 17:00", "2023-01-01 08:00", "", "TT_Task", "50", "1"]
        task2 = ["2", "1", "1", "A1010", "Activity 2", "TK_NotStart", "2023-01-08 08:00", "2023-01-12 17:00", "", "", "TT_Task", "0", "1"]
        task3 = ["3", "1", "1", "A1020", "Activity 3", "TK_NotStart", "2023-01-13 08:00", "2023-01-15 17:00", "", "", "TT_Task", "0", "1"]
        content += "%R\t" + "\t".join(task1) + "\n"
        content += "%R\t" + "\t".join(task2) + "\n"
        content += "%R\t" + "\t".join(task3) + "\n"

    # TASKPRED fields
    pred_f = "task_pred_id task_id pred_task_id proj_id pred_proj_id pred_type".split()
    content += "%T\tTASKPRED\n"
    content += "%F\t" + "\t".join(pred_f) + "\n"
    content += "%R\t1\t2\t1\t1\t1\tPR_FS\n"

    return content

if __name__ == "__main__":
    baseline_path = "tests/mock_baseline.xer"
    updated_path = "tests/mock_updated.xer"

    with open(baseline_path, "w") as f:
        f.write(create_mock_xer_content(baseline=True))

    with open(updated_path, "w") as f:
        f.write(create_mock_xer_content(baseline=False))

    try:
        xer = Reader(baseline_path)
        print("Baseline XER loaded successfully")
        projects = list(xer.projects)
        print("Projects:", [p.proj_short_name for p in projects])
        print("Activities:", [a.task_name for a in xer.activities])
        print("Data Date:", projects[0].last_recalc_date)

        xer2 = Reader(updated_path)
        print("Updated XER loaded successfully")
        projects2 = list(xer2.projects)
        print("Projects:", [p.proj_short_name for p in projects2])
        print("Activities:", [a.task_name for a in xer2.activities])
        print("Data Date:", projects2[0].last_recalc_date)
    except Exception as e:
        print("Error loading XER:", e)
        import traceback
        traceback.print_exc()
