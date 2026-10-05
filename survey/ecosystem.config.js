# PM2 ecosystem configuration for the Survey application
module.exports = {
  apps: [
    {
      name: 'survey-backend',
      cwd: './backend',
      script: 'dist/main.js',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'survey-frontend',
      cwd: './frontend',
      script: 'serve.js',
      env: {
        PORT: 4201,
        NODE_ENV: 'production',
      },
    },
  ],
};