module.exports = {
  apps: [
    {
      name: 'moonfit-backend',
      script: 'dist/server.js',
      instances: 1, // 1 proceso worker optimizado para VPS de 1-2 vCPUs
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '250M', // Reinicia automáticamente si excede 250MB para proteger el VPS
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
