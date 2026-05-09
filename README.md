# P6 Schedule Compare App

A web app that accepts exactly two Primavera P6 XER files (a baseline and an updated schedule), parses them using `xerparser`, compares their data (including dates, duration, activity existences), and displays a dynamic HTML dashboard with an AI-generated executive summary.

## Features
- **Upload 2 XER Files**: Specify baseline and updated schedules.
- **XER Parsing**: Leverages PyP6Xer (xerparser) to extract project data, activities, and data dates (`last_recalc_date`).
- **Data Date Handling**: Prominently shows both dates. Uses the cutoff date logic where applicable.
- **Deterministic Comparison**: Identifies added, deleted, changed activities, and computes start/finish variances.
- **AI Executive Summary**: Sends a compact JSON footprint of schedule variances to a free OpenRouter model (Gemini 2.5 flash) for narrative insights and schedule risk analysis.
- **Caching Engine**: Stores parsed models and variance dictionaries on local filesystem cache.
- **Export to CSV**: Generates a fast CSV export of all the computed variances.

## Requirements
- Python 3.9+
- See `requirements.txt` for dependencies.

## Installation

```bash
git clone https://github.com/your-username/p6-schedule-compare.git
cd p6-schedule-compare
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running the application

```bash
# Export your OpenRouter API key (Required for AI features)
export OPENROUTER_API_KEY="your-api-key-here"

# Start the Flask app
python -m app.main
```

Then visit `http://127.0.0.1:5000` in your web browser.

## Tests

To run the unit tests:

```bash
pytest tests/
```
