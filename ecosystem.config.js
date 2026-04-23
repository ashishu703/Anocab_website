module.exports = {
  apps: [
    {
      name: 'anocab-unified-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1111,
        ADMIN_EMAIL: 'anocab07@gmail.com',
        ADMIN_PASSWORD: 'Anocab@6262',
        API_BASE_URL: 'https://anocab.com',
        CORS_ORIGIN: '*',
        JWT_SECRET: 'anocab-jwt-secret-key-2026-super-secure-change-this',
        JWT_EXPIRES_IN: '24h',
        MONGODB_URI: 'mongodb+srv://ashishu703_db_user:Ashish7870@cluster0.rlc2rg5.mongodb.net/monzo?authSource=admin&retryWrites=true&w=majority',
        MAIL_HOST: 'smtp.gmail.com',
        MAIL_PORT: '587',
        MAIL_USER: 'anocab07@gmail.com',
        MAIL_PASS: 'your-app-password-here',
        NOTIFICATION_EMAIL: 'anocab07@gmail.com'
      },
      error_file: '/var/log/pm2/anocab-unified-backend-error.log',
      out_file: '/var/log/pm2/anocab-unified-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: true
    }
  ]
};
