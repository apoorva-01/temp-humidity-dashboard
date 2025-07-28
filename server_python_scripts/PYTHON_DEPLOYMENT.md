
# Python Service Deployment Guide

This guide provides instructions for deploying the Python Flask service, which handles data processing for the main application. This service will run on the same DigitalOcean Droplet as your Next.js application.

## Prerequisites

- You have already completed the deployment of the main Next.js application, as outlined in `DEPLOYMENT.md`.
- Your DigitalOcean Droplet is running and you have SSH access.

## Step 1: Install Python and Dependencies

1.  **Install Python and `pip`:**
    - Connect to your Droplet via SSH.
    - Python 3 is typically pre-installed on modern Ubuntu images. Verify the installation and install `pip`, the Python package installer.
      ```bash
      sudo apt-get update
      sudo apt-get install -y python3-pip
      ```

2.  **Copy the Python Service Files:**
    - Since you've already copied the entire application directory using `scp`, the Python scripts are already on your server in `/var/www/01-temp-hum/server_python_scripts`.

3.  **Install Python Dependencies:**
    - Navigate to the Python service directory and install the required packages using `requirements.txt`.
      ```bash
      cd /var/www/01-temp-hum/server_python_scripts
      sudo pip3 install -r requirements.txt
      ```

## Step 2: Configure the Environment

1.  **Set Environment Variables for the Python Service:**
    - The Python service needs access to the same `MONGODB_URI` as your main application. We will use a PM2 ecosystem file to manage environment variables for both applications in a structured way.

2.  **Create a PM2 Ecosystem File:**
    - An ecosystem file allows you to declare all your applications and their configurations in a single file.
    - In your application's root directory (`/var/www/01-temp-hum`), create a file named `ecosystem.config.js`:
      ```bash
      sudo nano /var/www/01-temp-hum/ecosystem.config.js
      ```
    - Add the following configuration. This file defines both your Next.js app and your Python service, ensuring they both have access to the `MONGODB_URI`.
      ```javascript
module.exports = {
  apps: [
    {
      name: '01-temp-hum-web-app',
      script: 'server.js', // <-- Instead of 'npm' + 'start', run the script directly
      cwd: '/var/www/01-temp-hum',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: '01-temp-hum-chart',
      script: '01-temp-hum-chart.py',
      interpreter: 'python3',
      cwd: '/var/www/01-temp-hum/server_python_scripts',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
      ```
      - **Note:** PM2 automatically makes environment variables from your `.env` file available to all applications it manages, so you don't need to redeclare `MONGODB_URI` here.

## Step 3: Manage Applications with PM2

1.  **Stop the Previous PM2 Process:**
    - If you previously started the Next.js app with `pm2 start`, you need to stop and delete it so that the new ecosystem file can manage it.
      ```bash
      sudo pm2 stop 01-temp-hum
      sudo pm2 delete 01-temp-hum
      ```

2.  **Start Services with the Ecosystem File:**
    - Navigate to your application's root directory and use the ecosystem file to start both services.
      ```bash
      cd /var/www/01-temp-hum
      sudo pm2 start ecosystem.config.js
      ```

3.  **Check Application Status:**
    - You should now see both `next-app` and `python-service` running.
      ```bash
      sudo pm2 status
      ```

4.  **Save the PM2 Configuration:**
    - To ensure both services restart automatically on server reboot, save the new PM2 process list.
      ```bash
      sudo pm2 save
      ```

## Step 4: Configure Nginx to Route to the Python Service

To allow your Next.js application to communicate with the Python service, you'll need to configure Nginx to route requests to it. We'll set up a new location block for a path like `/api/python`.

1.  **Update the Nginx Server Block:**
    - Open your Nginx configuration file:
      ```bash
      sudo nano /etc/nginx/sites-available/your-domain
      ```
    - Add a new `location` block to proxy requests to the Python service. This should be placed inside the existing `server` block.
      ```nginx
      server {
          # ... your existing configuration for the Next.js app ...

          location / {
              proxy_pass http://localhost:3789;
              # ... other proxy settings ...
          }

          # Add this new location block for the Python service
          location /api/python/ {
              proxy_pass http://localhost:1240/;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_cache_bypass $http_upgrade;
          }
      }
      ```

2.  **Test and Restart Nginx:**
    - Test your Nginx configuration for errors.
      ```bash
      sudo nginx -t
      ```
    - If the test is successful, restart Nginx to apply the changes.
      ```bash
      sudo systemctl restart nginx
      ```

## Step 5: Update Frontend Code to Use the New API Route

Finally, you'll need to update your frontend code to send requests to the new `/api/python/` endpoint. You'll need to find where in your Next.js application you are calling the Python service and update the URL.

## Conclusion

Your Python service is now running in production, managed by PM2, and accessible through Nginx. Both your Next.js application and your Python service are running concurrently and will restart automatically. 