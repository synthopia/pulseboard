/* global document */

const CONFIG = {
  RESPONSE_TIME_WARN: 800,
  RESPONSE_TIME_CRITICAL: 2000,
  HEARTBEAT_COUNT: 24,
  REFRESH_INTERVAL: 10000,
  MAX_RETRIES: 3,
};

let retryCount = 0;
let services = [];
let allChecks = [];

async function fetchWithRetry(url, maxRetries = CONFIG.MAX_RETRIES) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function fetchData() {
  try {
    document.getElementById('error').classList.add('hidden');

    allChecks = await fetchWithRetry('/api/v1/status/all-checks');
    retryCount = 0;

    return true;
  } catch (error) {
    retryCount++;
    console.error('Failed to fetch data:', error);
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('loading').classList.add('hidden');
    return false;
  }
}

function categorizeCheck(check) {
  if (!check) return 'unknown';
  if (check.category === 'err') return 'critical';
  if (check.responseTime >= CONFIG.RESPONSE_TIME_CRITICAL) return 'critical';
  if (
    check.category === 'warn' ||
    check.responseTime >= CONFIG.RESPONSE_TIME_WARN
  )
    return 'degraded';
  return 'operational';
}

function getStatusClasses(category) {
  const classes = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    critical: 'bg-red-500',
    unknown: 'bg-gray-400',
  };
  return classes[category] || 'bg-gray-400';
}

function getStatusTextColor(category) {
  const colors = {
    operational: 'text-green-700',
    degraded: 'text-yellow-700',
    critical: 'text-red-700',
    unknown: 'text-gray-700',
  };
  return colors[category] || 'text-gray-700';
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function renderHeartbeat(serviceChecks) {
  const recentChecks = serviceChecks
    .sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt))
    .slice(0, CONFIG.HEARTBEAT_COUNT);

  if (recentChecks.length === 0) {
    return '<div class="text-gray-400 text-sm">No data available</div>';
  }

  return recentChecks
    .map(check => {
      const category = categorizeCheck(check);
      const statusClass = getStatusClasses(category);
      const tooltip = `${formatTime(check.checkedAt)} - ${check.status} (${check.responseTime}ms)${check.error ? ' - ' + check.error : ''}`;

      return `<div class="w-3 h-8 ${statusClass} rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md" title="${tooltip}"></div>`;
    })
    .join('');
}

function getServiceStatus(latestCheck) {
  if (!latestCheck) return { text: 'No data available', category: 'unknown' };

  const category = categorizeCheck(latestCheck);

  switch (category) {
    case 'critical':
      return {
        text:
          latestCheck.error || `Service Down (${latestCheck.responseTime}ms)`,
        category: 'critical',
      };
    case 'degraded':
      return {
        text: `Performance Issues (${latestCheck.responseTime}ms)`,
        category: 'degraded',
      };
    case 'operational':
      return {
        text: `All Good (${latestCheck.responseTime}ms)`,
        category: 'operational',
      };
    default:
      return { text: 'Status Unknown', category: 'unknown' };
  }
}

function updateOverallStatus() {
  const statusIndicator = document.getElementById('overall-status');

  if (!services.length) {
    statusIndicator.innerHTML =
      '<div class="w-6 h-6 rounded-full bg-gray-400"></div><span class="text-gray-700">No services configured</span>';
    return;
  }

  const criticalCount = services.filter(s => {
    const status = getServiceStatus(s.latestCheck);
    return status.category === 'critical';
  }).length;

  const degradedCount = services.filter(s => {
    const status = getServiceStatus(s.latestCheck);
    return status.category === 'degraded';
  }).length;

  if (criticalCount > 0) {
    statusIndicator.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-red-500 animate-pulse-dot shadow-lg shadow-red-500/25"></div>
      <span class="text-red-700">Issues Detected (${criticalCount} critical)</span>
    `;
  } else if (degradedCount > 0) {
    statusIndicator.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-yellow-500 animate-pulse-dot shadow-lg shadow-yellow-500/25"></div>
      <span class="text-yellow-700">Degraded Performance (${degradedCount} affected)</span>
    `;
  } else {
    statusIndicator.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-green-500 animate-pulse-dot shadow-lg shadow-green-500/25"></div>
      <span class="text-green-700">All Systems Operational</span>
    `;
  }
}

function updateCriticalIssues() {
  const criticalIssuesDiv = document.getElementById('critical-issues');
  const criticalIssuesList = document.getElementById('critical-issues-list');

  const criticalServices = services.filter(s => {
    const status = getServiceStatus(s.latestCheck);
    return status.category === 'critical';
  });

  if (criticalServices.length === 0) {
    criticalIssuesDiv.classList.add('hidden');
    return;
  }

  criticalIssuesDiv.classList.remove('hidden');
  criticalIssuesList.innerHTML = criticalServices
    .map(service => {
      const status = getServiceStatus(service.latestCheck);
      const lastCheck = service.latestCheck
        ? formatRelativeTime(service.latestCheck.checkedAt)
        : 'Never';

      return `
      <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">${service.name}</p>
            <p class="text-sm text-red-700 mt-1">${status.text}</p>
            <p class="text-xs text-red-600 mt-1">Last checked: ${lastCheck}</p>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

function groupChecksByService(checks) {
  const grouped = {};
  checks.forEach(check => {
    if (!grouped[check.serviceId]) {
      grouped[check.serviceId] = [];
    }
    grouped[check.serviceId].push(check);
  });
  return grouped;
}

function extractServicesFromChecks(checks) {
  const servicesMap = new Map();

  checks.forEach(check => {
    if (!servicesMap.has(check.serviceId)) {
      servicesMap.set(check.serviceId, {
        id: check.serviceId,
        name: check.service.name,
        url: check.service.url,
        method: check.service.method,
        latestCheck: null,
      });
    }

    const service = servicesMap.get(check.serviceId);
    if (
      !service.latestCheck ||
      new Date(check.checkedAt) > new Date(service.latestCheck.checkedAt)
    ) {
      service.latestCheck = check;
    }
  });

  return Array.from(servicesMap.values()).sort((a, b) => a.id - b.id);
}

function render() {
  const checksByService = groupChecksByService(allChecks);
  services = extractServicesFromChecks(allChecks);

  const servicesGrid = document.getElementById('services-grid');

  if (services.length === 0) {
    servicesGrid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div class="text-gray-500 text-lg">No services found</div>
      </div>
    `;
  } else {
    servicesGrid.innerHTML = services
      .map(service => {
        const serviceChecks = checksByService[service.id] || [];
        const status = getServiceStatus(service.latestCheck);
        const lastCheck = service.latestCheck
          ? formatRelativeTime(service.latestCheck.checkedAt)
          : 'Never';
        const statusDotClass = getStatusClasses(status.category);
        const statusTextClass = getStatusTextColor(status.category);

        return `
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <!-- Service Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 ${statusDotClass} rounded-full shadow-sm"></div>
              <h3 class="text-lg font-semibold text-gray-900">${service.name}</h3>
            </div>
            <div class="text-sm ${statusTextClass} font-medium px-3 py-1 bg-gray-50 rounded-full">
              ${status.text.split('(')[0].trim()}
            </div>
          </div>
          
          <!-- Service URL -->
          <div class="mb-6">
            <div class="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg">
              ${service.method} ${service.url}
            </div>
          </div>
          
          <!-- Heartbeat -->
          <div class="mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">
              Response History (${CONFIG.HEARTBEAT_COUNT} recent checks)
            </div>
            <div class="flex gap-1 items-end">
              ${renderHeartbeat(serviceChecks)}
            </div>
          </div>
          
          <!-- Service Details -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Last check:</span> ${lastCheck}
            </div>
            <div class="text-sm font-medium text-gray-900">
              ${service.latestCheck ? `${service.latestCheck.responseTime}ms` : 'N/A'}
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  updateOverallStatus();
  updateCriticalIssues();

  document.getElementById('loading').classList.add('hidden');
  servicesGrid.classList.remove('hidden');
  document.getElementById('last-updated').textContent =
    new Date().toLocaleTimeString();
}

async function initialize() {
  const success = await fetchData();
  if (success) {
    render();
  }
}

// Auto-refresh
setInterval(async () => {
  const success = await fetchData();
  if (success) {
    render();
  }
}, CONFIG.REFRESH_INTERVAL);

// Initial load
initialize();
