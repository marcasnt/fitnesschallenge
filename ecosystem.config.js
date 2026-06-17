module.exports = {
  apps: [
    {
      name: "ifbb-fitness-challenge",
      script: ".next/standalone/server.js",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
