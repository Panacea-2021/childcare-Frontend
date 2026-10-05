/**
 * PM2 process file for production on EC2.
 * Started by GitHub Actions: `pm2 startOrReload ecosystem.config.cjs`
 */
module.exports = {
  apps: [
    {
      name: 'childcare-frontend',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
