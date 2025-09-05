import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { progressService } from '../services/progressService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ProgressDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await progressService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your progress data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Error loading dashboard: {error}
        </div>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData || dashboardData.overall_stats.total_questions === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">📊 Progress Dashboard</h1>
          <p className="dashboard-subtitle">Track your math practice progress</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No practice data yet</h3>
          <p>Start practicing with the Question Generator to see your progress here!</p>
        </div>
      </div>
    );
  }

  const { overall_stats, topic_performance, recent_activity, difficulty_performance } = dashboardData;

  // Prepare chart data
  const accuracyChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [overall_stats.correct_answers, overall_stats.total_questions - overall_stats.correct_answers],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#45a049', '#da190b'],
      },
    ],
  };

  const topicChartData = {
    labels: topic_performance.map(topic => topic.topic),
    datasets: [
      {
        label: 'Questions Attempted',
        data: topic_performance.map(topic => topic.total_questions),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
      {
        label: 'Correct Answers',
        data: topic_performance.map(topic => topic.correct_answers),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1,
      },
    ],
  };

  const difficultyChartData = {
    labels: difficulty_performance.map(diff => diff.difficulty.charAt(0).toUpperCase() + diff.difficulty.slice(1)),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: difficulty_performance.map(diff => diff.accuracy),
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        borderColor: ['#45a049', '#e68900', '#da190b'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📊 Progress Dashboard</h1>
        <p className="dashboard-subtitle">Track your math practice progress</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{overall_stats.total_questions}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overall_stats.correct_answers}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overall_stats.overall_accuracy}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{overall_stats.topics_practiced}</div>
          <div className="stat-label">Topics Practiced</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Overall Accuracy</h3>
          <Doughnut data={accuracyChartData} />
        </div>
        
        {topic_performance.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Performance by Topic</h3>
            <Bar data={topicChartData} options={chartOptions} />
          </div>
        )}
        
        {difficulty_performance.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Accuracy by Difficulty</h3>
            <Bar data={difficultyChartData} options={chartOptions} />
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recent_activity.length > 0 && (
        <div className="recent-activity">
          <h3 className="activity-title">Recent Activity</h3>
          {recent_activity.slice(0, 5).map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-question">
                {activity.question.length > 100 
                  ? `${activity.question.substring(0, 100)}...` 
                  : activity.question}
              </div>
              <div className="activity-details">
                <span className={`activity-result ${activity.is_correct ? 'correct' : 'incorrect'}`}>
                  {activity.is_correct ? 'Correct' : 'Incorrect'}
                </span>
                <span className="activity-topic">{activity.topic}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;