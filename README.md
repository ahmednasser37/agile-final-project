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

## Running the application (Locally)

```bash
# Export your OpenRouter API key (Required for AI features)
export OPENROUTER_API_KEY="your-api-key-here"

# Start the Flask app
python -m app.main
```

Then visit `http://127.0.0.1:5000` in your web browser.

## Free Deployment Options

This app is pre-configured to be deployed for **free** on popular hosting platforms.

### Option 1: Render.com (Recommended)
Render provides a generous free tier for Python web services.
1. Create a free account at [Render.com](https://render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository containing this code.
4. Render will automatically detect the `render.yaml` file and set up the deployment.
5. Once created, go to the project's **Environment** tab on Render and add your `OPENROUTER_API_KEY` secret.

### Option 2: Hugging Face Spaces
Hugging Face Spaces allows you to host Docker-based apps for free.
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set the "Space SDK" to **Docker**.
3. Upload all the files from this repository (or clone it to your space). The included `Dockerfile` is already configured for the HF environment (port 7860).
4. Go to your Space **Settings** -> **Variables and secrets** and add a secret named `OPENROUTER_API_KEY`.

## Tests

To run the unit tests:

```bash
pytest tests/
```
