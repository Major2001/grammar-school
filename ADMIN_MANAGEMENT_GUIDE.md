# Admin Management Guide

This guide explains how to manage admin users in your Grammar School application using the CLI tool.

## 🚀 Quick Start - Creating Your First Admin

```bash
# Navigate to the backend directory
cd backend

# Create the first admin user
python scripts/admin_cli.py create-admin admin admin@yourdomain.com your-secure-password

# Verify the admin was created
python scripts/admin_cli.py list-admins
```

## 📋 Available Admin Management Commands

The `admin_cli.py` script provides comprehensive admin management:

### User Management
```bash
# List all users
python scripts/admin_cli.py list-users

# List only admin users
python scripts/admin_cli.py list-admins

# Show system statistics
python scripts/admin_cli.py stats
```

### Admin Privilege Management
```bash
# Make an existing user an admin
python scripts/admin_cli.py make-admin username

# Remove admin privileges from a user
python scripts/admin_cli.py remove-admin username
```

### Account Management
```bash
# Activate a user account
python scripts/admin_cli.py activate username

# Deactivate a user account
python scripts/admin_cli.py deactivate username
```

## 🐳 Docker Deployment - Admin Management

### Creating First Admin in Docker

```bash
# Execute the admin CLI inside the running container
docker exec -it grammar-school-backend python scripts/admin_cli.py create-admin admin admin@yourdomain.com securepassword123

# Or run a one-time container for admin creation
docker run --rm \
  --network your-network \
  -e DATABASE_URL=postgresql://user:pass@host:port/dbname \
  -e SECRET_KEY=your-secret-key \
  -e JWT_SECRET_KEY=your-jwt-secret \
  -e FLASK_ENV=production \
  grammar-school-backend \
  python scripts/admin_cli.py create-admin admin admin@yourdomain.com securepassword123
```

## ☁️ AWS Deployment - Admin Management

### Using AWS ECS/Fargate

```bash
# Run admin creation command
aws ecs run-task \
  --cluster your-cluster-name \
  --task-definition your-task-definition \
  --overrides '{
    "containerOverrides": [{
      "name": "backend",
      "command": ["python", "scripts/admin_cli.py", "create-admin", "admin", "admin@yourdomain.com", "securepassword123"]
    }]
  }'
```

### Using AWS EC2

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to application
cd /path/to/your/application/backend

# Create admin
python scripts/admin_cli.py create-admin admin admin@yourdomain.com securepassword123
```

## 🔐 Security Best Practices

### Password Requirements
- Minimum 8 characters
- Use strong, unique passwords
- Consider using a password manager

### Admin Account Security
- Create admin accounts with strong passwords
- Regularly rotate admin passwords
- Monitor admin account activity
- Deactivate unused admin accounts

### Database Security
- Use environment variables for database credentials
- Enable SSL for database connections
- Regularly backup your database
- Restrict database access to application servers only

## 🚨 Troubleshooting

### Common Issues

1. **"Admin user already exists"**
   - Use `list-admins` to see existing admins
   - Use `make-admin` to promote existing users

2. **"User not found"**
   - Check username spelling
   - Use `list-users` to see available usernames

3. **Database connection issues**
   - Verify DATABASE_URL environment variable
   - Check database server accessibility
   - Ensure database credentials are correct

4. **Permission denied errors**
   - Ensure you're running as the correct user
   - Check file permissions on scripts
   - Verify database user has necessary privileges

### Getting Help

```bash
# Show all available commands
python scripts/admin_cli.py help

# Check system status
python scripts/admin_cli.py stats

# List all users to verify setup
python scripts/admin_cli.py list-users
```

## 📝 Production Checklist

Before going live, ensure:

- [ ] First admin account created
- [ ] Strong passwords used for all admin accounts
- [ ] Database credentials secured
- [ ] Environment variables properly set
- [ ] Admin management tested
- [ ] Backup procedures in place
- [ ] Monitoring configured for admin activities

## 🔄 Regular Maintenance

### Weekly Tasks
- Review admin user list
- Check for inactive accounts
- Monitor system statistics

### Monthly Tasks
- Rotate admin passwords
- Review user activity logs
- Update security configurations

### Quarterly Tasks
- Audit admin privileges
- Review and update security policies
- Test backup and recovery procedures
