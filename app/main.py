import os
import uuid
import tempfile
import pickle
import time
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename
from app.parser import parse_xer_file
from app.compare import compare_schedules
from app.ai import generate_ai_summary

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = 'super_secret_schedule_key'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads')
CACHE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../cache')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'xer'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_files():
    """Removes files older than 24 hours from uploads and cache directories."""
    now = time.time()
    cutoff = now - (24 * 3600)

    for directory in [UPLOAD_FOLDER, CACHE_FOLDER]:
        if not os.path.exists(directory):
            continue
        for filename in os.listdir(directory):
            filepath = os.path.join(directory, filename)
            if os.path.isfile(filepath) and os.stat(filepath).st_mtime < cutoff:
                try:
                    os.remove(filepath)
                except OSError:
                    pass

@app.route('/', methods=['GET', 'POST'])
def upload_files():
    # Cleanup old files on each GET/POST to the index route
    cleanup_old_files()

    if request.method == 'POST':
        if 'baseline' not in request.files or 'updated' not in request.files:
            flash('Both baseline and updated files are required.')
            return redirect(request.url)

        baseline_file = request.files['baseline']
        updated_file = request.files['updated']

        if baseline_file.filename == '' or updated_file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if not (allowed_file(baseline_file.filename) and allowed_file(updated_file.filename)):
            flash('Invalid file type. Only .xer files are allowed.')
            return redirect(request.url)

        if baseline_file and updated_file:
            # Save files securely
            session_id = str(uuid.uuid4())
            base_filename = secure_filename(baseline_file.filename)
            upd_filename = secure_filename(updated_file.filename)

            base_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_base_{base_filename}")
            upd_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_upd_{upd_filename}")

            baseline_file.save(base_path)
            updated_file.save(upd_path)

            try:
                # Parse and compare
                try:
                    baseline_sched = parse_xer_file(base_path)
                except Exception as e:
                    raise ValueError(f"Failed to parse Baseline XER: {str(e)}")

                try:
                    updated_sched = parse_xer_file(upd_path)
                except Exception as e:
                    raise ValueError(f"Failed to parse Updated XER: {str(e)}")

                comparison = compare_schedules(baseline_sched, updated_sched)

                # Generate AI Summary gracefully
                try:
                    ai_summary = generate_ai_summary(comparison)
                except Exception as e:
                    app.logger.error(f"AI generation failed: {e}")
                    ai_summary = {
                        "executive_summary": "AI summary failed to generate.",
                        "key_risks": [],
                        "main_variances": [],
                        "schedule_health_assessment": "N/A"
                    }

                # Cache results
                cache_path = os.path.join(CACHE_FOLDER, f"{session_id}.pkl")
                with open(cache_path, 'wb') as f:
                    pickle.dump({
                        "comparison": comparison,
                        "ai_summary": ai_summary
                    }, f)

                return redirect(url_for('dashboard', session_id=session_id))
            except ValueError as ve:
                flash(str(ve))
                return redirect(request.url)
            except Exception as e:
                flash(f"An unexpected error occurred: {str(e)}")
                return redirect(request.url)

    return render_template('upload.html')

@app.route('/dashboard/<session_id>')
def dashboard(session_id):
    # secure_filename validation for session_id isn't strictly needed as we check UUID format, but good for safety
    if not isinstance(session_id, str) or len(session_id) > 50 or '/' in session_id or '\\' in session_id:
        flash('Invalid session.')
        return redirect(url_for('upload_files'))

    cache_path = os.path.join(CACHE_FOLDER, f"{session_id}.pkl")
    if not os.path.exists(cache_path):
        flash('Session expired or not found.')
        return redirect(url_for('upload_files'))

    try:
        with open(cache_path, 'rb') as f:
            cached_data = pickle.load(f)

        # Handle older caches that were just the comparison object
        if isinstance(cached_data, dict) and "comparison" in cached_data:
            comparison = cached_data["comparison"]
            ai_summary = cached_data.get("ai_summary", {})
        else:
            comparison = cached_data
            ai_summary = {}

        return render_template('dashboard.html', comparison=comparison, ai_summary=ai_summary, session_id=session_id)
    except Exception as e:
        app.logger.error(f"Failed to load cache: {e}")
        flash('Error loading session data.')
        return redirect(url_for('upload_files'))

@app.route('/export/csv/<session_id>')
def export_csv(session_id):
    if not isinstance(session_id, str) or len(session_id) > 50 or '/' in session_id or '\\' in session_id:
        flash('Invalid session.')
        return redirect(url_for('upload_files'))

    cache_path = os.path.join(CACHE_FOLDER, f"{session_id}.pkl")
    if not os.path.exists(cache_path):
        flash('Session expired or not found.')
        return redirect(url_for('upload_files'))

    with open(cache_path, 'rb') as f:
        cached_data = pickle.load(f)

    comparison = cached_data["comparison"] if isinstance(cached_data, dict) and "comparison" in cached_data else cached_data

    import io
    import csv
    from flask import Response

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['Activity ID', 'Name', 'Status', 'Start Variance (Baseline -> Updated)', 'End Variance (Baseline -> Updated)'])

    for v in comparison.variances:
        start_var = f"{v.start_variance[0].strftime('%Y-%m-%d') if v.start_variance[0] else 'None'} -> {v.start_variance[1].strftime('%Y-%m-%d') if v.start_variance[1] else 'None'}" if v.start_variance else "None"
        end_var = f"{v.end_variance[0].strftime('%Y-%m-%d') if v.end_variance[0] else 'None'} -> {v.end_variance[1].strftime('%Y-%m-%d') if v.end_variance[1] else 'None'}" if v.end_variance else "None"

        writer.writerow([
            v.activity_code,
            v.name,
            v.status,
            start_var,
            end_var
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=variances.csv"}
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)