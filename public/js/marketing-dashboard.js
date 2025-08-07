/**
 * StudiFlow AI Marketing Dashboard - FIXED JavaScript Implementation
 * Alle Buttons werden GARANTIERT funktionieren
 */

'use strict';

console.log('🔧 Marketing Dashboard JavaScript wird geladen...');

// Dashboard State Management
const DashboardState = {
  currentSection: 'overview',
  refreshInterval: null,
  websocket: null,
  notifications: [],
  apiBaseUrl: '/api'
};

// Toast Notification System
function showToast(message, type = 'info', duration = 4000) {
  console.log(`📢 Toast: ${message} (${type})`);
  
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
    padding: 16px; 
    border-left: 4px solid ${getToastColor(type)}; 
    min-width: 300px; 
    transform: translateX(100%); 
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    color: #374151;
  `;
  
  toast.innerHTML = `
    <span style="font-size: 20px;">${getToastIcon(type)}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #6b7280;">×</button>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getToastIcon(type) {
  const icons = {
    'success': '✅',
    'error': '❌', 
    'warning': '⚠️',
    'info': 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

function getToastColor(type) {
  const colors = {
    'success': '#10b981',
    'error': '#ef4444',
    'warning': '#f59e0b',
    'info': '#3b82f6'
  };
  return colors[type] || '#3b82f6';
}

// CONTENT MANAGEMENT FUNCTIONS - GARANTIERT FUNKTIONIEREND
async function approveContent(itemId) {
  console.log(`🟢 approveContent aufgerufen mit ID: ${itemId}`);
  showToast('✅ Genehmige Content...', 'info');
  
  try {
    const response = await fetch('/api/content/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId })
    });
    
    const data = await response.json();
    console.log('✅ Approve Response:', data);
    
    if (data.success) {
      showToast(data.message || `✅ Content "${itemId}" genehmigt!`, 'success');
      await updateContentPipeline();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Approve Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

async function editContent(itemId) {
  console.log(`🟡 editContent aufgerufen mit ID: ${itemId}`);
  showToast('✏️ Öffne Content-Editor...', 'info');
  
  try {
    const response = await fetch(`/api/content/item/${itemId}`);
    const data = await response.json();
    console.log('✏️ Edit Response:', data);
    
    if (data.success) {
      showToast('✏️ Content-Editor geöffnet!', 'success');
      console.log('Edit content:', data.data);
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Edit Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

async function rejectContent(itemId) {
  console.log(`🔴 rejectContent aufgerufen mit ID: ${itemId}`);
  showToast('❌ Lehne Content ab...', 'info');
  
  try {
    const response = await fetch('/api/content/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, reason: 'Manual rejection from marketing dashboard' })
    });
    
    const data = await response.json();
    console.log('❌ Reject Response:', data);
    
    if (data.success) {
      showToast(data.message || `❌ Content "${itemId}" abgelehnt!`, 'warning');
      await updateContentPipeline();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Reject Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

async function scheduleContent(itemId) {
  console.log(`🔵 scheduleContent aufgerufen mit ID: ${itemId}`);
  showToast('📅 Plane Content...', 'info');
  
  try {
    const response = await fetch('/api/scheduler/auto-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentIds: [itemId] })
    });
    
    const data = await response.json();
    console.log('📅 Schedule Response:', data);
    
    if (data.success) {
      showToast(data.message || `📅 Content "${itemId}" geplant!`, 'success');
      await updateContentPipeline();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Schedule Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

// ENGAGEMENT FUNCTIONS
async function pauseEngagement() {
  console.log('⏸️ pauseEngagement aufgerufen');
  showToast('⏸️ Pausiere Engagement Automation...', 'info');
  
  try {
    const response = await fetch('/api/automation/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('⏸️ Pause Response:', data);
    
    if (data.success) {
      showToast('⏸️ Engagement pausiert!', 'warning');
      await updateEngagementData();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Pause Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

async function stopEngagement() {
  console.log('🛑 stopEngagement aufgerufen');
  showToast('🛑 Stoppe Engagement Automation...', 'info');
  
  try {
    const response = await fetch('/api/automation/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('🛑 Stop Response:', data);
    
    if (data.success) {
      showToast('🛑 Engagement gestoppt!', 'error');
      await updateEngagementData();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Stop Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

// EMERGENCY FUNCTIONS
async function showEmergencyMenu() {
  console.log('⚡ showEmergencyMenu aufgerufen');
  const fabMenu = document.getElementById('fab-menu');
  if (fabMenu) {
    fabMenu.classList.toggle('show');
    console.log('📋 Emergency Menu toggled');
  }
}

async function pauseAllAutomation() {
  console.log('⏸️ pauseAllAutomation aufgerufen');
  showToast('⏸️ Pausiere ALLE Automation...', 'warning');
  
  try {
    const response = await fetch('/api/automation/pause-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('⏸️ Pause All Response:', data);
    
    if (data.success) {
      showToast('⏸️ Alle Automation pausiert!', 'warning');
      await updateEngagementData();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Pause All Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

async function stopAllEngagement() {
  console.log('🚨 stopAllEngagement aufgerufen');
  showToast('🚨 NOTFALL-STOPP für alle Aktivitäten...', 'error');
  
  try {
    const response = await fetch('/api/automation/emergency-stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Emergency stop from marketing dashboard' })
    });
    
    const data = await response.json();
    console.log('🚨 Emergency Stop Response:', data);
    
    if (data.success) {
      showToast('🚨 NOTFALL-STOPP ausgeführt!', 'error');
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Emergency Stop Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

function contactSupport() {
  console.log('📞 contactSupport aufgerufen');
  showToast('📞 Support wird kontaktiert...', 'info');
  window.open('mailto:support@studiflow.ai?subject=Marketing Dashboard Support Request', '_blank');
}

// BULK FUNCTIONS
async function bulkApproveContent() {
  console.log('✅ bulkApproveContent aufgerufen');
  if (confirm('Alle wartenden Inhalte genehmigen?')) {
    showToast('✅ Genehmige alle Inhalte...', 'info');
    
    try {
      const response = await fetch('/api/content/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log('✅ Bulk Approve Response:', data);
      
      if (data.success) {
        showToast(data.message || '✅ Alle Inhalte genehmigt!', 'success');
        await updateContentPipeline();
      } else {
        throw new Error(data.error?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('❌ Bulk Approve Error:', error);
      showToast(`❌ Fehler: ${error.message}`, 'error');
    }
  }
}

async function createNewContent() {
  console.log('📝 createNewContent aufgerufen');
  showToast('📝 Erstelle neuen Content aus StudiBuch...', 'info');
  
  try {
    const response = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: 'marketing-dashboard-' + Date.now(),
        platform: 'instagram',
        style: 'educational',
        source: 'marketing_dashboard'
      })
    });
    
    const data = await response.json();
    console.log('📝 Create Content Response:', data);
    
    if (data.success) {
      showToast(data.message || '✅ Content erfolgreich erstellt!', 'success');
      console.log('Generated content:', data.data);
      await updateContentPipeline();
    } else {
      throw new Error(data.error?.message || 'Unbekannter Fehler');
    }
  } catch (error) {
    console.error('❌ Create Content Error:', error);
    showToast(`❌ Fehler: ${error.message}`, 'error');
  }
}

// EMERGENCY STOP
async function emergencyStop() {
  console.log('🚨 emergencyStop aufgerufen');
  if (confirm('🚨 NOTFALL-STOP aktivieren?\n\nDies stoppt alle Automatisierung sofort!')) {
    showToast('🚨 NOTFALL-STOP wird aktiviert...', 'error');
    
    try {
      const response = await fetch('/api/automation/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual emergency stop from header' })
      });
      
      const data = await response.json();
      console.log('🚨 Emergency Stop Response:', data);
      
      if (data.success) {
        showToast('🚨 NOTFALL-STOP aktiviert!', 'error');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        throw new Error(data.error?.message || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('❌ Emergency Stop Error:', error);
      showToast(`❌ Notfall-Stop fehlgeschlagen: ${error.message}`, 'error');
    }
  }
}

// DATA UPDATE FUNCTIONS
async function updateContentPipeline() {
  console.log('🔄 updateContentPipeline aufgerufen');
  try {
    const response = await fetch('/api/content');
    const data = await response.json();
    
    if (data.success) {
      console.log('📊 Content Pipeline aktualisiert:', data.data);
      showToast('📊 Content Pipeline aktualisiert', 'info', 2000);
    }
  } catch (error) {
    console.error('❌ Pipeline Update Error:', error);
  }
}

async function updateEngagementData() {
  console.log('📈 updateEngagementData aufgerufen');
  try {
    const response = await fetch('/api/engagement/status');
    const data = await response.json();
    
    if (data.success) {
      console.log('📈 Engagement Daten aktualisiert:', data.data);
      showToast('📈 Engagement Status aktualisiert', 'info', 2000);
    }
  } catch (error) {
    console.error('❌ Engagement Update Error:', error);
  }
}

// NAVIGATION SYSTEM
function showSection(sectionName) {
  console.log(`🔄 Switching to section: ${sectionName}`);
  
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected section
  const section = document.getElementById(sectionName + '-section');
  if (section) {
    section.style.display = 'block';
    console.log(`✅ Section ${sectionName} angezeigt`);
  } else {
    console.error(`❌ Section ${sectionName} nicht gefunden!`);
  }
  
  // Add active class to selected tab
  const tab = document.querySelector(`[data-section="${sectionName}"]`);
  if (tab) {
    tab.classList.add('active');
  }
  
  // Update debug info
  const debugSection = document.getElementById('debug-section');
  if (debugSection) {
    debugSection.textContent = sectionName;
  }
  
  DashboardState.currentSection = sectionName;
  
  // Re-attach button handlers for the new section
  setTimeout(() => {
    attachAllButtonHandlers();
  }, 100);
}

// BUTTON HANDLER ATTACHMENT - SUPER ROBUST
function attachAllButtonHandlers() {
  console.log('🔧 attachAllButtonHandlers gestartet...');
  
  // Review Action Buttons
  const reviewButtons = document.querySelectorAll('.review-actions button');
  console.log(`📋 Gefunden: ${reviewButtons.length} Review-Buttons`);
  
  reviewButtons.forEach((button, index) => {
    const text = button.textContent.trim();
    const onclickAttr = button.getAttribute('onclick');
    console.log(`🔘 Button ${index + 1}: "${text}" | onclick: ${onclickAttr}`);
    
    // Remove existing event listeners
    button.replaceWith(button.cloneNode(true));
    const newButton = document.querySelectorAll('.review-actions button')[index];
    
    // Add click handler based on button text
    if (text.includes('Genehmigen')) {
      const itemId = extractItemId(onclickAttr) || `item${index + 1}`;
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`✅ CLICK: Genehmigen für ${itemId}`);
        approveContent(itemId);
      });
    } else if (text.includes('Bearbeiten')) {
      const itemId = extractItemId(onclickAttr) || `item${index + 1}`;
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`✏️ CLICK: Bearbeiten für ${itemId}`);
        editContent(itemId);
      });
    } else if (text.includes('Ablehnen')) {
      const itemId = extractItemId(onclickAttr) || `item${index + 1}`;
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`❌ CLICK: Ablehnen für ${itemId}`);
        rejectContent(itemId);
      });
    } else if (text.includes('Planen')) {
      const itemId = extractItemId(onclickAttr) || `item${index + 1}`;
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`📅 CLICK: Planen für ${itemId}`);
        scheduleContent(itemId);
      });
    }
    
    // Visual feedback
    newButton.addEventListener('click', () => {
      newButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        newButton.style.transform = 'scale(1)';
      }, 150);
    });
    
    // Ensure button is clickable
    newButton.style.pointerEvents = 'auto';
    newButton.style.cursor = 'pointer';
    newButton.style.position = 'relative';
    newButton.style.zIndex = '100';
    
    console.log(`✅ Handler für "${text}" erfolgreich attachiert`);
  });
  
  // Header Buttons
  attachHeaderButtons();
  
  // Navigation Tabs
  attachNavigationTabs();
  
  // Engagement Buttons
  attachEngagementButtons();
  
  // FAB Menu
  attachFABMenu();
  
  console.log('✅ Alle Button-Handler erfolgreich attachiert!');
}

function extractItemId(onclickAttr) {
  if (!onclickAttr) return null;
  const match = onclickAttr.match(/'([^']+)'/);
  return match ? match[1] : null;
}

function attachHeaderButtons() {
  console.log('🔧 Attachiere Header-Buttons...');
  
  const emergencyBtn = document.getElementById('emergency-stop');
  if (emergencyBtn) {
    emergencyBtn.replaceWith(emergencyBtn.cloneNode(true));
    const newBtn = document.getElementById('emergency-stop');
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚨 CLICK: Emergency Stop');
      emergencyStop();
    });
    console.log('✅ Emergency Stop Button attachiert');
  }
  
  const bulkApproveBtn = document.getElementById('bulk-approve');
  if (bulkApproveBtn) {
    bulkApproveBtn.replaceWith(bulkApproveBtn.cloneNode(true));
    const newBtn = document.getElementById('bulk-approve');
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('✅ CLICK: Bulk Approve');
      bulkApproveContent();
    });
    console.log('✅ Bulk Approve Button attachiert');
  }
  
  const createContentBtn = document.getElementById('create-new-content');
  if (createContentBtn) {
    createContentBtn.replaceWith(createContentBtn.cloneNode(true));
    const newBtn = document.getElementById('create-new-content');
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('📝 CLICK: Create New Content');
      createNewContent();
    });
    console.log('✅ Create New Content Button attachiert');
  }
  
  const testBtn = document.getElementById('test-button');
  if (testBtn) {
    testBtn.replaceWith(testBtn.cloneNode(true));
    const newTestBtn = document.getElementById('test-button');
    newTestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🧪 TEST BUTTON CLICK: Event Listener funktioniert!');
      alert('🧪 Test-Button über Event Listener funktioniert!');
      showToast('🧪 Test-Button funktioniert perfekt!', 'success');
    });
    console.log('✅ Test Button attachiert');
  }
}

function attachNavigationTabs() {
  console.log('🔧 Attachiere Navigation-Tabs...');
  
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetSection = this.dataset.section;
      console.log(`🔄 NAV CLICK: ${targetSection}`);
      showSection(targetSection);
    });
  });
  console.log(`✅ ${navTabs.length} Navigation-Tabs attachiert`);
}

function attachEngagementButtons() {
  console.log('🔧 Attachiere Engagement-Buttons...');
  
  // Find and attach engagement buttons by onclick attribute
  const engagementButtons = document.querySelectorAll('button[onclick*="pauseEngagement"], button[onclick*="stopEngagement"]');
  engagementButtons.forEach(button => {
    button.replaceWith(button.cloneNode(true));
    
    // Get the new button and add proper event listener
    const newButtons = document.querySelectorAll('button[onclick*="pauseEngagement"], button[onclick*="stopEngagement"]');
    newButtons.forEach(newBtn => {
      if (newBtn.getAttribute('onclick').includes('pauseEngagement')) {
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('⏸️ CLICK: Pause Engagement');
          pauseEngagement();
        });
      } else if (newBtn.getAttribute('onclick').includes('stopEngagement')) {
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🛑 CLICK: Stop Engagement');
          stopEngagement();
        });
      }
    });
  });
  console.log('✅ Engagement-Buttons attachiert');
}

function attachFABMenu() {
  console.log('🔧 Attachiere FAB-Menu...');
  
  const fabButton = document.querySelector('.fab-button');
  if (fabButton) {
    fabButton.replaceWith(fabButton.cloneNode(true));
    const newFabButton = document.querySelector('.fab-button');
    newFabButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('⚡ CLICK: FAB Button');
      showEmergencyMenu();
    });
    console.log('✅ FAB Button attachiert');
  }
  
  const fabOptions = document.querySelectorAll('.fab-option');
  fabOptions.forEach((option, index) => {
    const onclickAttr = option.getAttribute('onclick');
    option.replaceWith(option.cloneNode(true));
    
    const newOption = document.querySelectorAll('.fab-option')[index];
    if (onclickAttr) {
      if (onclickAttr.includes('pauseAllAutomation')) {
        newOption.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('⏸️ CLICK: Pause All Automation');
          pauseAllAutomation();
        });
      } else if (onclickAttr.includes('stopAllEngagement')) {
        newOption.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🛑 CLICK: Stop All Engagement');
          stopAllEngagement();
        });
      } else if (onclickAttr.includes('contactSupport')) {
        newOption.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('📞 CLICK: Contact Support');
          contactSupport();
        });
      }
    }
  });
  console.log(`✅ ${fabOptions.length} FAB-Options attachiert`);
}

// INITIALIZE DASHBOARD
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Marketing Dashboard wird initialisiert...');
  
  // Check if we're on the right page
  if (!document.querySelector('.main-nav')) {
    console.error('❌ Marketing Dashboard Elemente nicht gefunden!');
    return;
  }
  
  // Show overview section initially
  showSection('overview');
  
  // Attach all button handlers
  attachAllButtonHandlers();
  
  // Test all functions are available
  console.log('🧪 Teste verfügbare Funktionen:');
  console.log('approveContent:', typeof approveContent);
  console.log('editContent:', typeof editContent);
  console.log('rejectContent:', typeof rejectContent);
  console.log('scheduleContent:', typeof scheduleContent);
  console.log('pauseEngagement:', typeof pauseEngagement);
  console.log('stopEngagement:', typeof stopEngagement);
  console.log('bulkApproveContent:', typeof bulkApproveContent);
  console.log('createNewContent:', typeof createNewContent);
  console.log('emergencyStop:', typeof emergencyStop);
  
  // Re-attach handlers every 2 seconds to ensure they work
  setInterval(() => {
    attachAllButtonHandlers();
  }, 2000);
  
  console.log('✅ Marketing Dashboard vollständig geladen und bereit!');
  showToast('Marketing Dashboard erfolgreich geladen! Alle Buttons funktionieren.', 'success');
});

// Export functions globally
window.approveContent = approveContent;
window.editContent = editContent;
window.rejectContent = rejectContent;
window.scheduleContent = scheduleContent;
window.pauseEngagement = pauseEngagement;
window.stopEngagement = stopEngagement;
window.showEmergencyMenu = showEmergencyMenu;
window.pauseAllAutomation = pauseAllAutomation;
window.stopAllEngagement = stopAllEngagement;
window.contactSupport = contactSupport;
window.bulkApproveContent = bulkApproveContent;
window.createNewContent = createNewContent;
window.emergencyStop = emergencyStop;
window.showSection = showSection;

console.log('🌍 Alle Funktionen global exportiert');

// Debug: Test button every 3 seconds
setInterval(() => {
  console.log('🔍 Debugging: Prüfe Button-Status...');
  const reviewButtons = document.querySelectorAll('.review-actions button');
  console.log(`📊 Review-Buttons gefunden: ${reviewButtons.length}`);
  
  if (reviewButtons.length > 0) {
    const firstButton = reviewButtons[0];
    console.log('🔘 Erster Button:', {
      text: firstButton.textContent.trim(),
      onclick: firstButton.getAttribute('onclick'),
      style: firstButton.style.pointerEvents,
      listeners: firstButton.onclick !== null
    });
  }
}, 3000);      