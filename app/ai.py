import os
import json
import logging
import requests
from typing import Dict, Any
from app.compare import ScheduleComparison

logger = logging.getLogger(__name__)

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")

# Choose a capable free model from SiliconFlow
DEFAULT_MODEL = "Qwen/Qwen2.5-7B-Instruct"

def generate_ai_summary(comparison: ScheduleComparison) -> Dict[str, Any]:
    if not SILICONFLOW_API_KEY:
        logger.warning("SILICONFLOW_API_KEY is not set. Skipping AI summary.")
        return {
            "executive_summary": "AI summary is disabled because the API key is not configured.",
            "key_risks": [],
            "main_variances": [],
            "schedule_health_assessment": "N/A"
        }

    # Prepare compact context
    context = {
        "baseline_data_date": comparison.baseline_date.isoformat() if comparison.baseline_date else "N/A",
        "updated_data_date": comparison.updated_date.isoformat() if comparison.updated_date else "N/A",
        "added_activities": comparison.added_activities,
        "deleted_activities": comparison.deleted_activities,
        "changed_activities": comparison.changed_activities,
        "top_variances": [
            {
                "id": v.activity_code,
                "name": v.name,
                "status": v.status
            }
            for v in comparison.variances if v.status != "unchanged"
        ][:20]  # Limit to top 20 to save tokens
    }

    prompt = f"""
You are an expert project scheduler and planner. I have compared a baseline schedule against an updated schedule.
Here is the summary of changes:
{json.dumps(context, indent=2)}

Please analyze this data and provide a strictly formatted JSON response with the following keys:
- executive_summary: A short paragraph explaining the overall changes.
- key_risks: An array of strings detailing potential risks based on the changes.
- main_variances: An array of strings highlighting the most critical variances.
- schedule_health_assessment: A short plain-language assessment of the project's current health trajectory.

Return ONLY valid JSON, nothing else.
"""

    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "response_format": { "type": "json_object" }
    }

    try:
        response = requests.post(
            "https://api.siliconflow.cn/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error calling SiliconFlow API: {e}")
        return {
            "executive_summary": f"Failed to generate AI summary: {str(e)}",
            "key_risks": [],
            "main_variances": [],
            "schedule_health_assessment": "Error"
        }
