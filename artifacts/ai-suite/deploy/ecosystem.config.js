module.exports = {
  apps: [{
    name: "mediageek",
    script: "pnpm",
    args: "start",
    cwd: "/var/www/mediageek/artifacts/ai-suite",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    watch: false,
    max_memory_restart: "1G",
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: "10s",
    out_file: "/var/log/pm2/mediageek-out.log",
    error_file: "/var/log/pm2/mediageek-error.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  }],
};
