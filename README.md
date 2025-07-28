# Smart Temperature & Humidity Monitoring System

![Dashboard Screenshot](./dashboard.png)

This is a Next.js application for monitoring temperature and humidity from IoT devices in real-time. It provides a dashboard to visualize data from different zones, view device statuses, and manage alerts.

## ✨ Features

- **Real-time Monitoring**: Live dashboard with temperature and humidity gauges for each connected device.
- **Device Management**: View a list of all devices, their status (online/offline), and detailed information.
- **Data Visualization**: Charts and graphs to analyze historical data.
- **Alerts**: Notifies when sensor readings are out of the configured range.
- **User Authentication**: Secure login for authorized users.
- **Data Export**: Export data to formats like CSV or PDF.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React Framework
- [React.js](https://reactjs.org/) - Frontend Library
- [Material-UI](https://mui.com/) - Component Library
- [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) - for data visualization
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - Object Data Modeling (ODM) library for MongoDB
- [Express.js](https://expressjs.com/) - Backend Framework for custom server
- [Zustand](https://github.com/pmndrs/zustand) - State Management
- [SWR](https://swr.vercel.app/) - React Hooks for Data Fetching

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your development machine:
- [Node.js](https://nodejs.org/en/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (either a local installation or a cloud-hosted instance)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your_username/your_repository_name.git
    cd your_repository_name
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables. You will need to configure your MongoDB connection string and a secret for JWT.
    ```env
    MONGODB_URI=mongodb://user:password@host:port/database
    JWT_SECRET=your_super_secret_jwt_key
    ```

### Running the Application

1.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

2.  **Build for production:**
    ```sh
    npm run build
    ```

3.  **Start the production server:**
    ```sh
    npm run start
    ```

## 📖 Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Creates a production build.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs the linter.

## Deployment

For deployment instructions, please refer to `DEPLOYMENT.md` for the main application and `server_python_scripts/PYTHON_DEPLOYMENT.md` for the Python scripts.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/your_username/your_repository_name/issues).

--- 