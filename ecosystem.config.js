module.exports = {
  apps: [
    {
      name: "kosmo-admin-frontend-staging",
      script: "pnpm",
      args: "start:staging",
      cwd: "/opt/kosmo-staging/kosmo-admin-frontend",
      env: {
        NODE_ENV: "staging",
        PORT: 3035
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M"
    }
  ]
};