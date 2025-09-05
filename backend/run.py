#!/usr/bin/env python3
"""
UTD Math Question Generator Backend Server
Run this file to start the Flask development server
"""

from app import app, init_db

if __name__ == '__main__':
    print("🚀 Starting UTD Math Question Generator Backend...")
    print("📊 Initializing database...")
    init_db()
    print("✅ Database initialized successfully!")
    print("🌐 Server starting on http://localhost:5000")
    print("📖 API Documentation available at http://localhost:5000/api/health")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )