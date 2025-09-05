# UTD Math Question Generator

A full-stack web application that helps University of Texas at Dallas students practice math problems using AI-generated questions. The app features user authentication, a chatbot for generating math questions, and a progress dashboard to track student performance.

## 🚀 Features

- **User Authentication**: Email/password signup and login, with Google Sign-in support
- **AI-Powered Question Generation**: Uses Google Gemini API to generate UTD-style math questions
- **Interactive Chatbot**: Natural conversation interface for requesting math problems
- **Progress Tracking**: Comprehensive dashboard showing student performance analytics
- **Topic Coverage**: Supports various math topics including Algebra, Calculus, Linear Algebra, Statistics, and more
- **Difficulty Levels**: Easy, Medium, and Hard question difficulties
- **Responsive Design**: Modern, mobile-friendly UI

## 🏗️ Architecture

### Backend (Python Flask)
- **Framework**: Flask with Flask-CORS
- **Database**: PostgreSQL (Supabase)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Endpoints**:
  - `/api/auth/signup` - User registration
  - `/api/auth/login` - User login
  - `/api/auth/google-login` - Google OAuth login
  - `/api/ai/generate_question` - AI question generation
  - `/api/progress/save` - Save student progress
  - `/api/progress/dashboard` - Get dashboard data

### Frontend (React)
- **Framework**: React 18 with React Router
- **Styling**: Custom CSS with modern gradients and animations
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Pages**:
  - Login/Signup Page
  - Home Page with Chatbot
  - Progress Dashboard

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- PostgreSQL database (Supabase account)
- Google Gemini API key

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd UTD-Math-Question-Generator
```

### 2. Backend Setup

#### Create Python Virtual Environment
```bash
cd backend
python -m venv venv

# On Windows
venv\\Scripts\\activate

# On macOS/Linux
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
The `.env` file is already created in the backend folder. Update the following variables:

```env
DATABASE_URL=postgresql://postgres.iyowacpgnsmmaszszhxux:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://iyowacpgnsmmaszszhxux.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3dhY3BnbnNtbXlzenNoeHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDg1NTQsImV4cCI6MjA3MjU4NDU1NH0.Cb5hQ5njtJHhwlCwe3NXxuxUKUYucyRJpfYFWo-zANU
LLM_API_KEY=YOUR_GEMINI_API_KEY
JWT_SECRET_KEY=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Important**: 
- Replace `YOUR_PASSWORD` with your actual Supabase database password
- Replace `YOUR_GEMINI_API_KEY` with your Google Gemini API key
- Generate a secure JWT secret key
- Add your Google OAuth credentials for Google Sign-in

#### Run the Backend Server
```bash
python app.py
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Environment Variables (Optional)
Create a `.env` file in the frontend folder if you want to change the API URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

#### Run the Frontend Server
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Database Setup
The application automatically creates the required database tables:
- `users` - User account information
- `progress` - Student practice progress and results

### Google Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your backend `.env` file as `LLM_API_KEY`

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add the credentials to your `.env` file

## 🚀 Usage

1. **Sign Up/Login**: Create a new account or login with existing credentials
2. **Generate Questions**: Use the chatbot to request math questions on specific topics
3. **Practice**: Solve the generated questions and submit your answers
4. **Track Progress**: View your performance analytics on the dashboard
5. **Improve**: Focus on topics where you need more practice

### Example Chatbot Interactions:
- "Generate an algebra question"
- "I need a hard calculus problem"
- "Give me an easy statistics question"
- "Create a differential equations problem"

## 📊 Features in Detail

### AI Question Generation
- Powered by Google Gemini API
- Generates UTD-style math questions
- Supports multiple difficulty levels
- Covers various mathematical topics
- Provides step-by-step solutions

### Progress Tracking
- Overall accuracy statistics
- Topic-wise performance analysis
- Difficulty-based progress tracking
- Recent activity history
- Visual charts and graphs

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Google OAuth integration
- Session management
- Protected routes

## 🛡️ Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Secure environment variable handling

## 🔍 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### AI Endpoints

#### POST `/api/ai/generate_question`
```json
{
  "topic": "algebra",
  "difficulty": "medium",
  "request": "Generate a quadratic equation problem"
}
```

### Progress Endpoints

#### POST `/api/progress/save`
```json
{
  "question": "Solve x^2 + 5x + 6 = 0",
  "user_answer": "x = -2, x = -3",
  "correct_answer": "x = -2, x = -3",
  "is_correct": true,
  "topic": "algebra",
  "difficulty": "medium"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your DATABASE_URL is correct
   - Check your Supabase credentials
   - Ensure your IP is whitelisted in Supabase

2. **AI API Error**
   - Verify your Gemini API key is valid
   - Check your API quota and billing
   - Ensure the API key has proper permissions

3. **Frontend Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **CORS Issues**
   - Verify Flask-CORS is installed
   - Check the CORS configuration in app.py
   - Ensure frontend URL is allowed

### Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that both servers are running on correct ports

## 🎯 Future Enhancements

- Real-time collaboration features
- Mobile app development
- Advanced analytics and insights
- Gamification elements
- Integration with UTD course curriculum
- Offline mode support
- Advanced AI tutoring features