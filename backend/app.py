from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import jwt
import datetime
import google.generativeai as genai
import requests
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
LLM_API_KEY = os.getenv('LLM_API_KEY')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')

# Configure Gemini AI
genai.configure(api_key=LLM_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Database connection
def get_db_connection():
    """Get database connection"""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

# Initialize database tables
def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            google_id VARCHAR(255),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Progress table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            question TEXT NOT NULL,
            user_answer TEXT,
            correct_answer TEXT,
            is_correct BOOLEAN,
            topic VARCHAR(255) NOT NULL,
            difficulty VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

# Authentication endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user already exists
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert new user
        cur.execute(
            'INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id',
            (email, password_hash, name)
        )
        user_id = cur.fetchone()['id']
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {'id': user_id, 'email': email, 'name': name}
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get user from database
        cur.execute('SELECT id, email, password_hash, name FROM users WHERE email = %s', (email,))
        user = cur.fetchone()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        cur.close()
        conn.close()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {'id': user['id'], 'email': user['email'], 'name': user['name']}
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/google-login', methods=['POST'])
def google_login():
    """Google login endpoint"""
    try:
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token
        response = requests.get(f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={google_token}')
        user_info = response.json()
        
        if 'error' in user_info:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        google_id = user_info['id']
        email = user_info['email']
        name = user_info['name']
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute('SELECT id, email, name FROM users WHERE google_id = %s OR email = %s', (google_id, email))
        user = cur.fetchone()
        
        if user:
            user_id = user['id']
            # Update google_id if not set
            if not user.get('google_id'):
                cur.execute('UPDATE users SET google_id = %s WHERE id = %s', (google_id, user_id))
                conn.commit()
        else:
            # Create new user
            cur.execute(
                'INSERT INTO users (email, google_id, name) VALUES (%s, %s, %s) RETURNING id',
                (email, google_id, name)
            )
            user_id = cur.fetchone()['id']
            conn.commit()
        
        cur.close()
        conn.close()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'message': 'Google login successful',
            'token': token,
            'user': {'id': user_id, 'email': email, 'name': name}
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI question generation endpoint
@app.route('/api/ai/generate_question', methods=['POST'])
@token_required
def generate_question(current_user_id):
    """Generate UTD-style math question using Gemini AI"""
    try:
        data = request.get_json()
        topic = data.get('topic', 'algebra')
        difficulty = data.get('difficulty', 'medium')
        specific_request = data.get('request', '')
        
        # Craft prompt for UTD-style math questions
        prompt = f"""
        Generate a UTD (University of Texas at Dallas) style math question for the topic: {topic}
        Difficulty level: {difficulty}
        
        {f'Specific request: {specific_request}' if specific_request else ''}
        
        Please provide:
        1. A clear, well-formatted question
        2. Step-by-step solution
        3. The final answer
        4. Any relevant formulas or concepts used
        
        Make the question challenging but appropriate for university-level mathematics.
        Format your response clearly with proper mathematical notation.
        """
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        generated_content = response.text
        
        return jsonify({
            'question': generated_content,
            'topic': topic,
            'difficulty': difficulty
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Progress tracking endpoints
@app.route('/api/progress/save', methods=['POST'])
@token_required
def save_progress(current_user_id):
    """Save student's answer and result"""
    try:
        data = request.get_json()
        question = data.get('question')
        user_answer = data.get('user_answer')
        correct_answer = data.get('correct_answer')
        is_correct = data.get('is_correct')
        topic = data.get('topic')
        difficulty = data.get('difficulty', 'medium')
        
        if not question or not topic:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO progress (user_id, question, user_answer, correct_answer, is_correct, topic, difficulty)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (current_user_id, question, user_answer, correct_answer, is_correct, topic, difficulty))
        
        progress_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Progress saved successfully',
            'progress_id': progress_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/progress/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user_id):
    """Get dashboard data for student's progress"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get overall stats
        cur.execute('''
            SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                COUNT(DISTINCT topic) as topics_practiced
            FROM progress 
            WHERE user_id = %s
        ''', (current_user_id,))
        
        overall_stats = cur.fetchone()
        
        # Get topic-wise performance
        cur.execute('''
            SELECT 
                topic,
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 2) as accuracy
            FROM progress 
            WHERE user_id = %s
            GROUP BY topic
            ORDER BY total_questions DESC
        ''', (current_user_id,))
        
        topic_performance = cur.fetchall()
        
        # Get recent activity
        cur.execute('''
            SELECT question, user_answer, is_correct, topic, created_at
            FROM progress 
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        ''', (current_user_id,))
        
        recent_activity = cur.fetchall()
        
        # Get difficulty-wise performance
        cur.execute('''
            SELECT 
                difficulty,
                COUNT(*) as total_questions,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 2) as accuracy
            FROM progress 
            WHERE user_id = %s
            GROUP BY difficulty
        ''', (current_user_id,))
        
        difficulty_performance = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Calculate overall accuracy
        overall_accuracy = 0
        if overall_stats['total_questions'] > 0:
            overall_accuracy = round((overall_stats['correct_answers'] / overall_stats['total_questions']) * 100, 2)
        
        return jsonify({
            'overall_stats': {
                'total_questions': overall_stats['total_questions'],
                'correct_answers': overall_stats['correct_answers'],
                'topics_practiced': overall_stats['topics_practiced'],
                'overall_accuracy': overall_accuracy
            },
            'topic_performance': topic_performance,
            'recent_activity': recent_activity,
            'difficulty_performance': difficulty_performance
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'UTD Math Question Generator API is running'}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)