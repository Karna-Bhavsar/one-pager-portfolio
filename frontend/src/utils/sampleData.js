// Sample data generator for dashboard widgets
export const generateSampleData = (type, config = {}) => {
  const today = new Date();
  
  switch (type) {
    case 'fitness':
      return {
        metrics: [
          { title: 'Daily Steps', value: 8542, target: 10000, unit: 'steps', color: 'blue' },
          { title: 'Calories Burned', value: 2840, target: 3000, unit: 'cal', color: 'orange' },
          { title: 'Active Minutes', value: 87, target: 120, unit: 'min', color: 'green' },
          { title: 'Distance', value: 6.2, target: 8.0, unit: 'km', color: 'purple' }
        ],
        charts: [
          {
            title: 'Weekly Steps',
            type: 'area',
            data: generateTimeSeriesData(7, 6000, 12000)
          },
          {
            title: 'Monthly Weight',
            type: 'line',
            data: generateTimeSeriesData(30, 70, 75, 'weight')
          }
        ],
        activities: generateActivityData(15)
      };

    case 'habits':
      return {
        streaks: [
          { title: 'Meditation', current: 15, target: 30, unit: 'days', type: 'streak' },
          { title: 'Reading', current: 23, target: 50, unit: 'days', type: 'streak' },
          { title: 'Water Intake', current: 7, target: 8, unit: 'glasses', type: 'daily' }
        ],
        progress: [
          { title: 'Morning Routine', current: 18, target: 21, unit: 'days this month' },
          { title: 'No Social Media', current: 5, target: 7, unit: 'days this week' }
        ],
        calendar: generateHabitCalendar(30)
      };

    case 'learning':
      return {
        metrics: [
          { title: 'Books Read', value: 12, target: 24, unit: 'books', color: 'green' },
          { title: 'Study Hours', value: 45, target: 60, unit: 'hours', color: 'blue' },
          { title: 'Courses Completed', value: 3, target: 5, unit: 'courses', color: 'purple' }
        ],
        progress: [
          { title: 'JavaScript Mastery', current: 75, target: 100, unit: '%' },
          { title: 'Reading Goal 2024', current: 12, target: 24, unit: 'books' }
        ],
        subjects: generateSubjectData()
      };

    case 'custom':
    default:
      return {
        metrics: [
          { title: 'Total Count', value: 156, target: 200, unit: 'items', color: 'blue' },
          { title: 'Weekly Average', value: 22, target: 30, unit: 'per week', color: 'green' }
        ],
        charts: [
          {
            title: 'Progress Over Time',
            type: 'line',
            data: generateTimeSeriesData(14, 10, 50)
          }
        ]
      };
  }
};

const generateTimeSeriesData = (days, min, max, label = 'value') => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      [label]: Math.floor(Math.random() * (max - min) + min)
    });
  }
  
  return data;
};

const generateActivityData = (count) => {
  const activities = [
    'Morning Run', 'Gym Session', 'Yoga Class', 'Swimming', 'Cycling',
    'Weight Training', 'Cardio Workout', 'Pilates', 'Tennis', 'Basketball'
  ];
  
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      activity: activities[Math.floor(Math.random() * activities.length)],
      duration: `${Math.floor(Math.random() * 60 + 15)} min`,
      calories: Math.floor(Math.random() * 400 + 200)
    });
  }
  
  return data;
};

const generateHabitCalendar = (days) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random completion (70% chance)
    if (Math.random() > 0.3) {
      data.push(date.toISOString().split('T')[0]);
    }
  }
  
  return data;
};

const generateSubjectData = () => [
  { id: 1, subject: 'JavaScript', progress: 85, lastStudied: '2024-01-18', hoursSpent: 25 },
  { id: 2, subject: 'React', progress: 70, lastStudied: '2024-01-17', hoursSpent: 18 },
  { id: 3, subject: 'Node.js', progress: 45, lastStudied: '2024-01-15', hoursSpent: 12 },
  { id: 4, subject: 'Database Design', progress: 60, lastStudied: '2024-01-14', hoursSpent: 15 }
];

// Pre-built dashboard templates with sample widgets
export const getDashboardTemplate = (templateType) => {
  const sampleData = generateSampleData(templateType);
  
  const templates = {
    fitness: [
      {
        widget_id: 'widget_steps',
        widget_type: 'metric',
        title: 'Daily Steps',
        config: { color: 'blue', showTarget: true, showTrend: true }
      },
      {
        widget_id: 'widget_calories',
        widget_type: 'metric',
        title: 'Calories Burned',
        config: { color: 'orange', showTarget: true }
      },
      {
        widget_id: 'widget_steps_chart',
        widget_type: 'chart',
        title: 'Weekly Steps Trend',
        config: { type: 'area', color: '#3B82F6' }
      },
      {
        widget_id: 'widget_workout_progress',
        widget_type: 'progress',
        title: 'Monthly Workout Goal',
        config: { type: 'circular', color: 'green' }
      },
      {
        widget_id: 'widget_activities',
        widget_type: 'table',
        title: 'Recent Activities',
        config: { pageSize: 5 }
      }
    ],
    
    habits: [
      {
        widget_id: 'widget_meditation_streak',
        widget_type: 'progress',
        title: 'Meditation Streak',
        config: { type: 'streak', color: 'purple' }
      },
      {
        widget_id: 'widget_reading_progress',
        widget_type: 'progress',
        title: 'Reading Goal',
        config: { type: 'linear', color: 'green' }
      },
      {
        widget_id: 'widget_habit_calendar',
        widget_type: 'progress',
        title: 'Habit Calendar',
        config: { type: 'streak', color: 'blue' }
      },
      {
        widget_id: 'widget_daily_habits',
        widget_type: 'metric',
        title: 'Today\'s Habits',
        config: { color: 'green', size: 'large' }
      }
    ],
    
    learning: [
      {
        widget_id: 'widget_books_read',
        widget_type: 'metric',
        title: 'Books Read This Year',
        config: { color: 'green', showTarget: true }
      },
      {
        widget_id: 'widget_study_hours',
        widget_type: 'metric',
        title: 'Study Hours This Month',
        config: { color: 'blue', showTarget: true }
      },
      {
        widget_id: 'widget_learning_progress',
        widget_type: 'progress',
        title: 'Course Progress',
        config: { type: 'linear', color: 'purple' }
      },
      {
        widget_id: 'widget_subjects',
        widget_type: 'table',
        title: 'Subject Progress',
        config: { sortable: true }
      }
    ],
    
    custom: [
      {
        widget_id: 'widget_main_metric',
        widget_type: 'metric',
        title: 'Main Metric',
        config: { color: 'blue', showTarget: true, size: 'large' }
      },
      {
        widget_id: 'widget_trend_chart',
        widget_type: 'chart',
        title: 'Trend Analysis',
        config: { type: 'line', color: '#10B981' }
      }
    ]
  };
  
  return templates[templateType] || templates.custom;
};