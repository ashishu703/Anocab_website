module.exports = {
  apps: [
    {
      name: 'anocab-website-backend',
      script: './backend/server.js',
      instances: 1, // Changed from 2 to 1 - cluster mode causes session issues
      exec_mode: 'fork', // Changed from cluster to fork for session consistency
      env: {
        NODE_ENV: 'production',
        PORT: 1111,
        ADMIN_EMAIL: 'anocab07@gmail.com',
        ADMIN_PASSWORD: 'Anocab@6262',
        API_BASE_URL: 'https://anocab.com',
        CORS_ORIGIN: '*',
        SESSION_SECRET: 'anocab-production-secret-key-2026-secure',
        MONGODB_URI: 'mongodb+srv://ashishu703_db_user:Ashish7870@cluster0.rlc2rg5.mongodb.net/monzo?authSource=admin&retryWrites=true&w=majority'
      },
      error_file: '/var/log/pm2/anocab-website-backend-error.log',
      out_file: '/var/log/pm2/anocab-website-backend-out.log',
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
    },
    {
      name: 'anocab-website-admin',
      script: './admin_panel/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1112,
        ADMIN_EMAIL: 'anocab07@gmail.com',
        ADMIN_PASSWORD: 'Anocab@6262',
        APP_URL: 'https://anocab.com',
        SESSION_SECRET: 'anocab-production-secret-key-2026-secure',
        MONGODB_URI: 'mongodb+srv://ashishu703_db_user:Ashish7870@cluster0.rlc2rg5.mongodb.net/monzo?authSource=admin&retryWrites=true&w=majority'
      },
      error_file: '/var/log/pm2/anocab-website-admin-error.log',
      out_file: '/var/log/pm2/anocab-website-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '300M',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'anocab-website-careers',
      script: './apply_now/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1113
      },
      error_file: '/var/log/pm2/anocab-website-careers-error.log',
      out_file: '/var/log/pm2/anocab-website-careers-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '300M',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
