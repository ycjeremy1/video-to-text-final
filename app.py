from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from pathlib import Path
from backend import summarize,translation,server



app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

upload_path = Path(__file__).parent / "uploads"



folder_path = os.path.join(os.path.dirname(__file__), 'uploads')
file_names = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mp3', 'wav'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload folder (absolute path)
upload_path = Path(__file__).parent / UPLOAD_FOLDER
upload_path.mkdir(exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Allowed file types: mp4, mp3, wav'}), 400
    
    try:
        filename = secure_filename(file.filename)
        save_path = upload_path / filename
        
        # Save file
        file.save(save_path)
        
        # Verify file was saved
        if not save_path.exists():
            return jsonify({'error': 'Failed to save file'}), 500
        
        return jsonify({
            'status': 'success',
            'filename': filename,
            'size': os.path.getsize(save_path),
            'path': f'/uploads/{filename}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(upload_path, filename)





@app.route('/api/summarize', methods=['GET'])
def summarizetext():
    index = request.args.get('index')
    return summarize.summarize(str(upload_path / file_names[int(index)]))



@app.route('/api/transcription', methods=['GET'])
def transcribevideo():
    index = request.args.get('index')
    return server.local_transcribe(str(upload_path / file_names[int(index)]))


@app.route('/api/translate', methods=['GET'])
def translate():
    index = request.args.get('index')
    return translation.run_translate(str(upload_path / file_names[int(index)]))

if __name__ == '__main__':
    print(f"Server running. Upload directory: {upload_path}")
    print(f"Access the app at: http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)