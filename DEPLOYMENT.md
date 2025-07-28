
# Production Deployment on DigitalOcean

This guide provides step-by-step instructions for deploying this Next.js application to a production environment on a DigitalOcean Droplet.

## Prerequisites

- A DigitalOcean account.
- A registered domain name.
- An SSH key pair for secure server access.
- `git` installed on your local machine.

## Step 1: Set Up a DigitalOcean Droplet

1.  **Create a Droplet:**
    - Log in to your DigitalOcean account.
    - Click **Create > Droplets**.
    - **Choose an Image > Marketplace** and select the **Node.js** image. This pre-installs Node.js and npm.
    - **Choose a Plan:** Select a plan that meets your application's needs (a basic plan is a good starting point).
    - **Choose a Datacenter Region:** Select a region close to your target audience.
    - **Authentication:** Select **SSH keys** and add your public SSH key.
    - **Hostname:** Give your Droplet a descriptive name.
    - Click **Create Droplet**.

2.  **Access Your Droplet:**
    - Once the Droplet is created, copy its public IP address.
    - Connect to the Droplet via SSH:
      ```bash
      ssh root@YOUR_DROPLET_IP
      ```

## Step 2: Configure the Server Environment

1.  **Update and Install Packages:**
    - Update the package manager and install Nginx, a web server and reverse proxy:
      ```bash
      sudo apt-get update
      sudo apt-get install -y nginx
      ```

2.  **Install `nvm` and a modern version of Node.js:**
    - The default Node.js version may be outdated. Use `nvm` to install and manage Node.js versions.
      ```bash
      # Download and install nvm
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

      # Source nvm to use it in the current session
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

      # Install Node.js v18 (LTS)
      nvm install 18

      # Set the installed version as the default
      nvm alias default 18
      ```

3.  **Install PM2:**
    - PM2 is a process manager for Node.js applications that will keep your app running.
      ```bash
      sudo npm install -g pm2
      ```

---
**IMPORTANT NOTE:**
The command `sudo npm install -g pm2` will install PM2 using the system's default (and likely old) version of npm. After installing a modern Node.js with `nvm`, you should install PM2 again without `sudo` to ensure it's managed by the correct Node version:
`npm install -g pm2`
---

4.  **Configure Firewall:**
    - Allow SSH, HTTP, and HTTPS traffic through the firewall:
      ```bash
      sudo ufw allow 'OpenSSH'
      sudo ufw allow 'Nginx Full'
      sudo ufw --force enable
      ```

## Step 3: Deploy Application Code

Instead of cloning the repository directly on the server, we'll build the application locally and copy the files using `scp` (secure copy). This approach avoids installing development dependencies and build tools on the production server.

**On your local machine:**

1.  **Build the application:**
    - Make sure all dependencies are installed (`npm install` or `yarn install`).
    - Run the production build command:
      ```bash
      npm run build
      ```

2.  **Archive your application files:**
    - Create a `tar.gz` archive of your project. This command excludes `node_modules`, `.git`, and other unnecessary files.
      ```bash
      zip -r 01-temp-hum.zip .next .env public server_python_scripts stores styles themes server.js package.json
      ```

3.  **Copy the archive to your Droplet:**
    - Use `scp` to upload the archive to your server.
      ```bash
      scp 01-temp-hum.zip root@159.223.68.164:/var/www/01-temp-hum
      ```
    - Replace `YOUR_DROPLET_IP` with your Droplet's IP address.


**On your DigitalOcean Droplet:**

1.  **Connect to your Droplet:**
    ```bash
    ssh root@YOUR_DROPLET_IP
    ```

2.  **Prepare the directory and extract files:**
    - Create the application directory.
      ```bash
      sudo mkdir -p /var/www/01-temp-hum
      ```
    - Move the archive from `/tmp`, extract it, and then remove the archive.
      ```bash
      sudo mv /tmp/01-temp-hum.tar.gz /var/www/01-temp-hum/
      cd /var/www/01-temp-hum
      sudo tar -xzvf 01-temp-hum.tar.gz
      sudo rm 01-temp-hum.tar.gz
      ```

3.  **Install Production Dependencies:**
    - Install only the production dependencies from your `package.json`.
      ```bash
      # If you are using npm
      sudo npm install --production

      # If you are using yarn
      sudo yarn install --production
      ```

4.  **Set Up Environment Variables:**
    - Create a `.env` file for your production environment variables.
      ```bash
      sudo nano .env
      ```
    - Add the following, replacing the placeholder values:
      ```
      MONGODB_URI=YOUR_PRODUCTION_MONGODB_URI
      JWT_SECRET=YOUR_JWT_SECRET
      ```
      - **`MONGODB_URI`**: The connection string for your production database. See Step 4 for more details.
      - **`JWT_SECRET`**: A strong, unique secret for signing JSON Web Tokens.

## Step 4: Set Up a Production Database

For a production environment, a managed database is highly recommended.

1.  **Create a Managed MongoDB Database on DigitalOcean:**
    - In your DigitalOcean account, go to **Create > Databases**.
    - Choose **MongoDB** and select a plan.
    - Secure your database by restricting access to your Droplet.
    - Once created, find your database's **Connection String** and add it to your `.env` file.

## Step 5: Configure Nginx as a Reverse Proxy

1.  **Create an Nginx Server Block:**
    - Create a new Nginx configuration file for your domain:
      ```bash
      sudo nano /etc/nginx/sites-available/your-domain
      ```
    - Add the following configuration, replacing `your-domain.com` with your actual domain:
      ```nginx
      server {
          listen 80;
          server_name your-domain.com www.your-domain.com;

          location / {
              proxy_pass http://localhost:3789;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_cache_bypass $http_upgrade;
          }
      }
      ```

2.  **Enable the Server Block:**
    - Create a symbolic link to enable the new configuration:
      ```bash
      sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
      ```
    - Test the Nginx configuration for errors:
      ```bash
      sudo nginx -t
      ```
    - If the test is successful, restart Nginx:
      ```bash
      sudo systemctl restart nginx
      ```

## Step 6: Secure Your Site with SSL (Let's Encrypt)

1.  **Install Certbot:**
    - Certbot is a tool that automates the process of obtaining and renewing SSL certificates from Let's Encrypt.
      ```bash
      sudo apt-get install -y certbot python3-certbot-nginx
      ```

2.  **Obtain an SSL Certificate:**
    - Run Certbot, following the on-screen prompts:
      ```bash
      sudo certbot --nginx -d your-domain.com -d www.your-domain.com
      ```
    - Certbot will automatically update your Nginx configuration to handle HTTPS.

## Step 7: Start the Application with PM2

1.  **Start Your Application using the Ecosystem File:**
    - Navigate to your application's directory. Use the `ecosystem.config.js` file to start all services (both the Next.js app and the Python service). This is the recommended approach.
      ```bash
      cd /var/www/01-temp-hum
      sudo pm2 start ecosystem.config.js
      ```
    - The `ecosystem.config.js` file should be present in this directory as described in `server_python_scripts/PYTHON_DEPLOYMENT.md`.

2.  **Enable PM2 to Start on Boot:**
    - Ensure your application restarts automatically if the server reboots:
      ```bash
      sudo pm2 startup
      ```
    - Follow the on-screen instructions, which will provide a command to run.
    - Save the current PM2 process list:
      ```bash
      sudo pm2 save
      ```

## Step 8: Update DNS Records

1.  **Point Your Domain to the Droplet:**
    - In your domain registrar's DNS settings, create an **A record** that points your domain (`your-domain.com`) to your Droplet's public IP address.
    - Create a **CNAME record** for `www` that points to `your-domain.com`.

## Conclusion

Your Next.js application should now be live and accessible at your domain. You can monitor your application's logs and status using PM2:

-   **View logs:** `sudo pm2 logs 01-temp-hum`
-   **View status:** `sudo pm2 status`
-   **Restart app:** `sudo pm2 restart 01-temp-hum` 