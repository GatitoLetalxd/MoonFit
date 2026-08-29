module.exports = {
  apps: [
    {
      name: 'moonfit-backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork', // Modo fork: 1 solo proceso para ahorrar memoria en VPS de 1 vCPU
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Reinicia automáticamente si excede 400MB para evitar OOM
      node_args: '--max-old-space-size=400', // Limita el heap de V8 a 400MB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
