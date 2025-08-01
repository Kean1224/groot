// Performance monitoring middleware
const os = require('os');

let connectionCount = 0;
let peakConnections = 0;

const performanceMonitor = {
  // Track concurrent connections
  incrementConnections() {
    connectionCount++;
    if (connectionCount > peakConnections) {
      peakConnections = connectionCount;
    }
  },

  decrementConnections() {
    connectionCount--;
  },

  // Get system stats
  getStats() {
    return {
      connections: {
        current: connectionCount,
        peak: peakConnections
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
        system: Math.round(os.totalmem() / 1024 / 1024) // MB
      },
      cpu: {
        loadAvg: os.loadavg(),
        uptime: Math.round(process.uptime())
      }
    };
  },

  // Log performance every 30 seconds
  startMonitoring() {
    setInterval(() => {
      const stats = this.getStats();
      console.log('📊 Performance Stats:', {
        connections: stats.connections.current,
        memoryUsed: `${stats.memory.used}MB`,
        cpuLoad: stats.cpu.loadAvg[0].toFixed(2)
      });

      // Alert if approaching limits
      if (stats.connections.current > 800) {
        console.warn('⚠️  High connection count:', stats.connections.current);
      }
      if (stats.memory.used > 3000) { // 3GB warning for 4GB plan
        console.warn('⚠️  High memory usage:', stats.memory.used + 'MB');
      }
    }, 30000);
  }
};

module.exports = performanceMonitor;
