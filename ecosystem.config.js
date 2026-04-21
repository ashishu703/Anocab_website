module.exports = {
  apps: [
    {
      name: 'anocab-backend',
      script: './backend/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 1111
      },
      error_file: '/var/log/pm2/anocab-backend-error.log',
      out_file: '/var/log/pm2/anocab-backend-out.log',
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
      name: 'anocab-admin',
      script: './admin_panel/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1112
      },
      error_file: '/var/log/pm2/anocab-admin-error.log',
      out_file: '/var/log/pm2/anocab-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '300M',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'anocab-careers',
      script: './apply_now/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 1113
      },
      error_file: '/var/log/pm2/anocab-careers-error.log',
      out_file: '/var/log/pm2/anocab-careers-out.log',
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
