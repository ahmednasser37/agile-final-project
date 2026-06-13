export const XER_TABLES = {
  CURRTYPE: ['curr_id', 'decimal_digit_cnt', 'curr_short_name', 'curr_symbol'],
  CALENDAR: ['clndr_id', 'default_flag', 'clndr_name', 'proj_id', 'base_clndr_id', 'clndr_data', 'clndr_type', 'day_hr_cnt', 'week_hr_cnt', 'month_hr_cnt', 'year_hr_cnt', 'last_chng_date'],
  PROJECT: ['proj_id', 'proj_short_name', 'plan_start_date', 'plan_end_date', 'scd_end_tm', 'clndr_id'],
  PROJWBS: ['wbs_id', 'proj_id', 'obs_id', 'seq_num', 'wbs_short_name', 'wbs_name', 'parent_wbs_id', 'proj_node_flag', 'status_code'],
  TASK: ['task_id', 'proj_id', 'wbs_id', 'clndr_id', 'task_code', 'task_name', 'task_type', 'duration_type', 'status_code', 'target_drtn_hr_cnt', 'target_start_date', 'target_end_date', 'early_start_date', 'early_end_date', 'late_start_date', 'late_end_date', 'total_float_hr_cnt', 'free_float_hr_cnt', 'cstr_type', 'cstr_date', 'rsrc_id', 'complete_pct_type'],
  TASKPRED: ['task_pred_id', 'task_id', 'pred_task_id', 'proj_id', 'pred_proj_id', 'pred_type', 'lag_hr_cnt'],
  TASKRSRC: ['taskrsrc_id', 'task_id', 'proj_id', 'rsrc_id', 'remain_qty', 'target_qty', 'target_cost'],
  RSRC: ['rsrc_id', 'rsrc_short_name', 'rsrc_name', 'rsrc_type', 'clndr_id']
};
