module.exports = {
    apps: [
        {
            name: "yeshiva-chill-backend",
            script: "server.js",
            cwd: __dirname,
            instances: 1,
            autorestart: true,
            watch: false,
            max_restarts: 25,
            restart_delay: 3000,
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};
