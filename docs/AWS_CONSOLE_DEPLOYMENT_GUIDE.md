# AWS Console Deployment Guide - Grammar School Application

This guide walks you through deploying your Grammar School application to AWS using only the AWS Console (web interface) and SSH. No command line tools required!

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] Terminal (built-in on Mac/Linux)
- [ ] Git repository with your application code (GitHub, GitLab, or Bitbucket)
- [ ] Git installed locally (for initial setup)

## 🏗️ Architecture Overview

Simple, cost-effective architecture for 10-15 users:

```
Internet → EC2 (t3.micro) → SQLite Database
                ↓
            Docker Containers
         (Frontend + Backend + Nginx)
```

**Estimated Monthly Cost: ~$8-10**

## 🚀 Step-by-Step Deployment

### Step 0: Prepare Git Repository (If Not Done Already)

1. **Create a new repository** on GitHub, GitLab, or Bitbucket
2. **Upload your application code**:
   ```bash
   # Initialize git repository
   git init
   
   # Add all files
   git add .
   
   # Commit changes
   git commit -m "Initial commit - Grammar School Application"
   
   # Add remote repository
   git remote add origin https://github.com/yourusername/grammar-school.git
   
   # Push to repository
   git push -u origin main
   ```

3. **Note down your repository URL** for later use

### Step 1: Create Key Pair

1. **Go to AWS Console** → **EC2** → **Key Pairs**
2. Click **"Create key pair"**
3. **Name**: `grammar-school-key`
4. **Key pair type**: RSA
5. **Private key file format**: `.pem`
6. Click **"Create key pair"**
7. **Download the `.pem` file** and save it securely

### Step 2: Create Security Group

1. **Go to AWS Console** → **EC2** → **Security Groups**
2. Click **"Create security group"**
3. **Security group name**: `grammar-school-sg`
4. **Description**: `Security group for Grammar School Application`
5. **VPC**: Select your default VPC
6. **Inbound rules**:
   - **Type**: SSH, **Port**: 22, **Source**: Anywhere (0.0.0.0/0)
   - **Type**: HTTP, **Port**: 80, **Source**: Anywhere (0.0.0.0/0)
   - **Type**: HTTPS, **Port**: 443, **Source**: Anywhere (0.0.0.0/0)
7. Click **"Create security group"**

### Step 3: Launch EC2 Instance

1. **Go to AWS Console** → **EC2** → **Instances**
2. Click **"Launch instance"**
3. **Name**: `grammar-school-server`
4. **Application and OS Images**: 
   - **AMI**: Amazon Linux 2023 (or Amazon Linux 2)
   - **Architecture**: 64-bit (x86)
5. **Instance type**: `t3.micro` (Free tier eligible)
6. **Key pair**: Select `grammar-school-key`
7. **Network settings**:
   - **VPC**: Select your default VPC
   - **Subnet**: Select any public subnet
   - **Auto-assign public IP**: Enable
   - **Security group**: Select `grammar-school-sg`
8. **Configure storage**:
   - **Volume type**: gp3
   - **Size**: 20 GiB
9. **Advanced details** → **User data** (paste the script below):

```bash
#!/bin/bash
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /home/ec2-user/grammar-school
cd /home/ec2-user/grammar-school

# Create logs directory
mkdir -p logs

# Create environment file
cat > .env << EOL
DATABASE_URL=sqlite:///grammar_school.db
SECRET_KEY=$(openssl rand -base64 32)
JWT_SECRET_KEY=$(openssl rand -base64 32)
FLASK_ENV=production
EOL

# Note: Application code will be cloned from Git repository
```

10. Click **"Launch instance"**
11. **Wait for instance to be "Running"** (2-3 minutes)

### Step 4: Get Instance Details

1. **Select your instance** in the EC2 console
2. **Note down the Public IPv4 address** (e.g., `54.123.45.67`)
3. **Note down the Public IPv4 DNS** (e.g., `ec2-54-123-45-67.compute-1.amazonaws.com`)

### Step 5: Connect to Your Instance

```bash
# Make key file secure
chmod 400 grammar-school-key.pem

# Connect to instance
ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
```

### Step 6: Deploy Application Code Using Git

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Clone your repository**:
   ```bash
   # Remove existing directory if it exists (with proper permissions)
   sudo rm -rf /home/ec2-user/grammar-school
   
   # Clone your repository (replace with your actual repo URL)
   git clone https://github.com/yourusername/grammar-school.git /home/ec2-user/grammar-school
   cd /home/ec2-user/grammar-school
   ```

3. **If your repository is private, set up authentication**:
   ```bash
   # Remove existing directory if it exists
   rm -rf /home/ec2-user/grammar-school
   
   # Option 1: Using Personal Access Token
   git clone https://YOUR_TOKEN@github.com/yourusername/grammar-school.git /home/ec2-user/grammar-school
   
   # Option 2: Using SSH key (recommended for private repos)
   # First, add your SSH key to GitHub, then:
   git clone git@github.com:yourusername/grammar-school.git /home/ec2-user/grammar-school
   ```

#### Using File Upload (Fallback)

If you don't have Git repository set up:

1. **Create a zip file locally**:
   ```bash
   zip -r grammar-school.zip . -x "node_modules/*" "venv/*" ".git/*"
   ```

2. **Upload using SCP**:
   ```bash
   scp -i grammar-school-key.pem grammar-school.zip ec2-user@YOUR_PUBLIC_IP:/home/ec2-user/
   ```

3. **SSH and extract**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   cd /home/ec2-user
   unzip grammar-school.zip -d grammar-school/
   cd grammar-school
   ```

### Step 7: Deploy Application on EC2

1. **SSH into your instance** (if not already connected):
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Navigate to application directory**:
   ```bash
   cd /home/ec2-user/grammar-school
   ```

3. **Extract application** (only if you used file upload method):
   ```bash
   unzip grammar-school.zip
   ```

4. **Update Docker Compose (if needed)**:
   ```bash
   # Check current version
   docker-compose --version
   
   # If version is too old, update it
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

5. **Start the application**:
   ```bash
   docker-compose up -d --build
   ```

6. **Check if everything is running**:
   ```bash
   docker-compose ps
   ```

7. **View logs** (if needed):
   ```bash
   docker-compose logs -f
   ```

### Step 8: Create First Admin User

1. **Wait for backend to be ready** (30 seconds):
   ```bash
   sleep 30
   ```

2. **Create admin user**:
   ```bash
   docker exec -it $(docker ps -q -f name=backend) python scripts/admin_cli.py create-admin admin admin@yourdomain.com securepassword123
   ```

3. **Verify admin was created**:
   ```bash
   docker exec -it $(docker ps -q -f name=backend) python scripts/admin_cli.py list-admins
   ```

### Step 9: Test Your Application

1. **Open your web browser**
2. **Go to**: `http://YOUR_PUBLIC_IP`
3. **You should see your Grammar School application!**

## ⚙️ Environment Variables Configuration

### Required Environment Variables

The application uses the following environment variables (automatically set in the deployment):

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `DATABASE_URL` | SQLite database path | `sqlite:///grammar_school.db` | ✅ |
| `SECRET_KEY` | Flask secret key for sessions | Auto-generated | ✅ |
| `JWT_SECRET_KEY` | JWT token signing key | Auto-generated | ✅ |
| `FLASK_ENV` | Flask environment | `production` | ✅ |

### Optional Environment Variables

You can customize these by editing the `.env` file on your EC2 instance:

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `FLASK_DEBUG` | Enable debug mode | `False` | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | `["*"]` | ❌ |
| `LOG_LEVEL` | Logging level | `INFO` | ❌ |
| `MAX_CONTENT_LENGTH` | Max file upload size | `16777216` (16MB) | ❌ |

### Viewing Current Environment Variables

To see your current environment variables on the EC2 instance:

```bash
# SSH into your instance
ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP

# View environment file
cat /home/ec2-user/grammar-school/.env

# Or view from inside the container
docker exec -it $(docker ps -q -f name=backend) env | grep -E "(DATABASE_URL|SECRET_KEY|JWT_SECRET_KEY|FLASK_ENV)"
```

### Updating Environment Variables

To update environment variables:

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Edit the environment file**:
   ```bash
   nano /home/ec2-user/grammar-school/.env
   ```

3. **Restart the application**:
   ```bash
   cd /home/ec2-user/grammar-school
   docker-compose down
   docker-compose up -d
   ```

### Security Notes

- **SECRET_KEY** and **JWT_SECRET_KEY** are automatically generated with secure random values
- **Never commit** the `.env` file to your Git repository
- **Change default values** if you need custom configuration
- **Keep your keys secure** - they're used for session management and JWT tokens

## 🌐 Domain Setup (Optional)

### Using Route 53

1. **Go to AWS Console** → **Route 53** → **Hosted zones**
2. **Create hosted zone**:
   - **Domain name**: `yourdomain.com`
   - **Type**: Public hosted zone
3. **Create A record**:
   - **Record name**: Leave blank (for root domain) or `www`
   - **Record type**: A
   - **Value**: Your EC2 public IP
   - **TTL**: 300
4. **Update your domain's nameservers** at your domain registrar

### SSL Certificate (Optional)

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Install Certbot**:
   ```bash
   sudo yum install -y certbot
   ```

3. **Get SSL certificate**:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

4. **Update nginx configuration** (if needed):
   ```bash
   sudo nano /home/ec2-user/grammar-school/nginx/nginx.conf
   ```

## 🔄 Updating Your Application

### Updating Code from Git Repository

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Navigate to application directory**:
   ```bash
   cd /home/ec2-user/grammar-school
   ```

3. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

4. **Restart application**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **Check status**:
   ```bash
   docker-compose ps
   ```

### Automated Deployment Script

Create a simple deployment script on your EC2 instance:

```bash
# SSH into your instance
ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP

# Create deployment script
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user/grammar-school
echo "Pulling latest changes..."
git pull origin main
echo "Stopping application..."
docker-compose down
echo "Starting application..."
docker-compose up -d
echo "Checking status..."
docker-compose ps
echo "Deployment completed!"
EOF

# Make script executable
chmod +x /home/ec2-user/deploy.sh
```

**To deploy updates, simply run**:
```bash
ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP "/home/ec2-user/deploy.sh"
```

## 📊 Monitoring and Maintenance

### CloudWatch Monitoring

1. **Go to AWS Console** → **CloudWatch** → **Alarms**
2. **Create alarm**:
   - **Metric**: EC2 → CPUUtilization
   - **Instance**: Select your instance
   - **Threshold**: 80%
   - **Actions**: Send notification to SNS topic

### Viewing Logs

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **View application logs**:
   ```bash
   cd /home/ec2-user/grammar-school
   docker-compose logs -f
   ```

3. **View specific service logs**:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f nginx
   ```

### Database Backup

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Create backup script**:
   ```bash
   cat > backup-db.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/home/ec2-user/backups"
   mkdir -p $BACKUP_DIR
   DATE=$(date +%Y%m%d_%H%M%S)
   cp /home/ec2-user/grammar-school/backend/instance/grammar_school.db $BACKUP_DIR/grammar_school_$DATE.db
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "grammar_school_*.db" -mtime +7 -delete
   EOF
   
   chmod +x backup-db.sh
   ```

3. **Set up daily backups**:
   ```bash
   (crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-db.sh") | crontab -
   ```

## 🔧 Troubleshooting

### Common Git Issues

1. **Git clone fails with "destination path already exists"**
   ```bash
   # Remove the existing directory (with proper permissions)
   sudo rm -rf /home/ec2-user/grammar-school
   
   # Then clone again
   git clone https://github.com/yourusername/grammar-school.git /home/ec2-user/grammar-school
   ```

2. **Permission denied when removing directory**
   ```bash
   # Force remove the directory and all contents with sudo
   sudo rm -rf /home/ec2-user/grammar-school
   
   # Then clone again
   git clone https://github.com/yourusername/grammar-school.git /home/ec2-user/grammar-school
   ```

3. **Docker Compose buildx version error**
   ```bash
   # Install Docker Buildx plugin
   mkdir -p ~/.docker/cli-plugins/
   curl -SL https://github.com/docker/buildx/releases/latest/download/buildx-$(uname -s)-$(uname -m) -o ~/.docker/cli-plugins/docker-buildx
   chmod +x ~/.docker/cli-plugins/docker-buildx
   
   # Verify buildx version
   docker buildx version
   
   # Try building again
   docker-compose up -d --build
   ```

4. **Alternative: Use Docker build instead of compose build**
   ```bash
   # Build images manually
   docker build -t grammar-school-backend ./backend
   docker build -t grammar-school-frontend ./frontend
   
   # Start with compose (without build)
   docker-compose up -d
   ```

4. **Docker Compose version warning**
   ```bash
   # Remove the obsolete version line from docker-compose.yml
   sed -i '1d' docker-compose.yml
   
   # Or manually edit the file
   nano docker-compose.yml
   # Remove the first line: version: '3.8'
   ```

### Application Not Accessible

1. **Check if containers are running**:
   ```bash
   docker-compose ps
   ```

2. **Check logs**:
   ```bash
   docker-compose logs
   ```

3. **Restart services**:
   ```bash
   docker-compose restart
   ```

### Database Issues

1. **Check if database file exists**:
   ```bash
   ls -la /home/ec2-user/grammar-school/backend/instance/
   ```

2. **Test database connection**:
   ```bash
   docker exec -it $(docker ps -q -f name=backend) python -c "
   from app import create_app, db
   app = create_app()
   with app.app_context():
       print('Database connection:', db.engine.execute('SELECT 1').scalar())
   "
   ```

### High Memory Usage

1. **Check memory usage**:
   ```bash
   docker stats
   ```

2. **Restart containers**:
   ```bash
   docker-compose restart
   ```

## 💰 Cost Management

### Current Monthly Costs

- **EC2 t3.micro**: ~$8.50
- **Storage (20GB)**: ~$2.00
- **Data Transfer**: ~$1.00
- **Total**: ~$11.50/month

### Cost Optimization Tips

1. **Stop instance when not in use**:
   - Go to EC2 Console → Select instance → Actions → Instance State → Stop
   - Start when needed: Actions → Instance State → Start

2. **Use Spot Instances** (for non-critical workloads):
   - Go to EC2 Console → Spot Requests → Request Spot Instances

3. **Monitor usage**:
   - Go to AWS Console → Cost Explorer
   - Set up billing alerts

## 🔐 Security Best Practices

### Regular Updates

1. **SSH into your instance**:
   ```bash
   ssh -i grammar-school-key.pem ec2-user@YOUR_PUBLIC_IP
   ```

2. **Update system packages**:
   ```bash
   sudo yum update -y
   ```

3. **Update Docker images**:
   ```bash
   cd /home/ec2-user/grammar-school
   docker-compose pull
   docker-compose up -d
   ```

### Access Management

1. **Go to AWS Console** → **IAM** → **Users**
2. **Create IAM user** for team members
3. **Attach policies**: `AmazonEC2ReadOnlyAccess`
4. **Create access keys** if needed

## 📈 Scaling Up

### Upgrade Instance

1. **Stop your instance**:
   - EC2 Console → Select instance → Actions → Instance State → Stop

2. **Change instance type**:
   - Actions → Instance Settings → Change Instance Type
   - Select `t3.small` or `t3.medium`

3. **Start instance**:
   - Actions → Instance State → Start

### Add Load Balancer

1. **Go to AWS Console** → **EC2** → **Load Balancers**
2. **Create Application Load Balancer**
3. **Configure target groups**
4. **Update security groups**

## 🎯 Next Steps

After successful deployment:

1. ✅ **Test all functionality**
2. ✅ **Create admin users**
3. ✅ **Configure monitoring**
4. ✅ **Set up backups**
5. ✅ **Document access procedures**
6. ✅ **Train users**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review AWS CloudWatch logs
3. Check application logs: `docker-compose logs`
4. Verify security group settings
5. Test database connectivity

---

**🎉 Congratulations! Your Grammar School application is now running on AWS!**

**Access your application at**: `http://YOUR_PUBLIC_IP`

**💰 Total monthly cost**: ~$11.50

**🔧 Management**: Everything can be managed through AWS Console and SSH!
