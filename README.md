# Marketing Dashboard

A full-stack marketing dashboard application for tracking and analyzing marketing campaigns across multiple platforms.

## 🚀 Features

- **Campaign Management**: Track and manage marketing campaigns across Google, Facebook, Instagram, Twitter, and LinkedIn
- **Real-time Analytics**: View impressions, clicks, conversions, and ROI metrics
- **Interactive Charts**: Visualize data with Chart.js powered graphs
- **Responsive Design**: Built with Tailwind CSS for a modern, mobile-friendly interface
- **RESTful API**: Express backend with TypeScript for type-safe development

## 📁 Project Structure

```
marketing-dashboard/
├── client/                 # React Frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── ...
│
├── server/                 # Node.js/Express Backend (TypeScript)
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   └── ...
│
├── data/                   # Mock data for development
│   ├── campaigns.json     # Sample campaign data
│   ├── analytics.json     # Sample analytics data
│   └── README.md          # Data documentation
│
└── plans/                  # Project planning documents
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketing-dashboard
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

1. **Start the backend server** (from the `server` directory)
   ```bash
   npm run dev
   ```
   The server will start at http://localhost:3001

2. **Start the frontend** (from the `client` directory)
   ```bash
   npm run dev
   ```
   The client will start at http://localhost:5173

### Building for Production

**Client:**
```bash
cd client
npm run build
```

**Server:**
```bash
cd server
npm run build
npm start
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | Get all campaigns |
| GET | `/api/campaigns/:id` | Get campaign by ID |
| GET | `/api/analytics` | Get all analytics data |
| GET | `/api/analytics/dashboard` | Get dashboard metrics |
| GET | `/health` | Health check endpoint |

## 🎨 Available Scripts

### Client

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Server

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production server |

## 📊 Mock Data

The `data/` directory contains sample JSON files for development:

- **campaigns.json**: 8 sample marketing campaigns with various statuses
- **analytics.json**: Dashboard metrics, daily analytics, and platform breakdown

See [`data/README.md`](data/README.md) for detailed data structure documentation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
```

### Vite Proxy

The client is configured to proxy `/api` requests to the backend server. See [`client/vite.config.ts`](client/vite.config.ts).

## 🧠 Technical Decisions

### Automated Threat Detection System

This dashboard implements an **automated alerting system** designed to detect four specific business threats identified in the marketing brief:

#### 1. APAC Regional Conversion Gap 🚨
- **Detection Logic**: Monitors APAC region's trial-to-paid conversion rate
- **Alert Trigger**: When APAC rate falls within 6-12% (compared to North America baseline of 15-25%)
- **Business Impact**: Identifies 50-75% underperformance requiring pricing localization or payment method investigation
- **Component**: [`CriticalAlerts.tsx`](client/src/components/CriticalAlerts.tsx)

#### 2. Q3 2025 Performance Dip 📉
- **Detection Logic**: Compares Q3 2025 (July-September) metrics against Q2 2025 baseline
- **Alert Trigger**: Traffic drop >5%, conversion drop >5%, or churn spike >10%
- **Business Impact**: Identifies seasonal or competitive pressure requiring immediate investigation
- **Component**: [`CriticalAlerts.tsx`](client/src/components/CriticalAlerts.tsx)

#### 3. AI Overview Cannibalization 🤖
- **Detection Logic**: Identifies educational content keywords ("how to", "tutorial", "guide") with 10-35% YoY traffic decline
- **Alert Trigger**: Educational keywords + `ai_overview_triggered: "Yes"` + declining traffic
- **Business Impact**: Signals need to pivot from informational to transactional/comparison keywords
- **Component**: [`ProblemKeywordsTable.tsx`](client/src/components/ProblemKeywordsTable.tsx)

#### 4. Wasted Social Media Spend 💸
- **Detection Logic**: Monitors social channel (Organic Social, Paid Social) conversion rates
- **Alert Trigger**: Social channel conversion rate below 2%
- **Business Impact**: Identifies budget reallocation opportunities to higher-performing channels
- **Component**: [`CriticalAlerts.tsx`](client/src/components/CriticalAlerts.tsx)

### Why Automated Alerts?

Rather than requiring manual data analysis, the dashboard automatically:
1. **Parses CSV data** on server startup using `csv-parser`
2. **Applies business rules** to detect threshold violations
3. **Prioritizes alerts** (Critical → Warning → Info → Success)
4. **Provides actionable insights** with specific recommendations

This approach ensures that critical business threats are surfaced immediately without requiring deep data analysis expertise from the user.

### Additional Features

- **Wasted Traffic Detection**: Keywords with >2,000 traffic but <1.5% conversion rate are highlighted in red
- **Real-time Connection Status**: Green/red indicator shows server connectivity
- **Dual-Axis Charts**: ComposedChart with bars (traffic) and lines (conversions) for trend analysis
- **Conversion Funnel**: Visual representation of user journey from traffic to paid conversion

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
