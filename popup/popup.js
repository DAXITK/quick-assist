// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;

    // Update active states
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`${tabName}-tab`).classList.add("active");
  });
});

// Auto-parse Full Name into First Name and Last Name
document.getElementById("fullName").addEventListener("input", (e) => {
  const fullName = e.target.value.trim();

  if (fullName) {
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    document.getElementById("firstName").value = firstName;
    document.getElementById("lastName").value = lastName;
  } else {
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
  }
});

// Allow manual edits to reconstruct Full Name
function updateFullNameFromParts() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();

  if (firstName || lastName) {
    const fullNameField = document.getElementById("fullName");
    const currentFullName = fullNameField.value.trim();
    const reconstructed = `${firstName} ${lastName}`.trim();

    // Only update if user hasn't manually changed full name
    if (!currentFullName || currentFullName === reconstructed) {
      fullNameField.value = reconstructed;
    }
  }
}

document
  .getElementById("firstName")
  .addEventListener("input", updateFullNameFromParts);
document
  .getElementById("lastName")
  .addEventListener("input", updateFullNameFromParts);

// Load saved profile data
async function loadProfile() {
  const data = await chrome.storage.local.get('profileData');
  if (data.profileData) {
    const profile = data.profileData;
    Object.keys(profile).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        element.value = profile[key] || '';
      }
    });
    
    // Trigger name parsing if fullName exists but firstName/lastName don't
    if (profile.fullName && !profile.firstName) {
      document.getElementById('fullName').dispatchEvent(new Event('input'));
    }
  }
}


// Save profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const profileData = {
    fullName: document.getElementById('fullName').value,
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    linkedin: document.getElementById('linkedin').value,
    portfolio: document.getElementById('portfolio').value,
    location: document.getElementById('location').value,
    currentTitle: document.getElementById('currentTitle').value,
    currentCompany: document.getElementById('currentCompany').value,
    yearsExperience: document.getElementById('yearsExperience').value,
    summary: document.getElementById('summary').value,
    degree: document.getElementById('degree').value,
    fieldOfStudy: document.getElementById('fieldOfStudy').value,
    university: document.getElementById('university').value,
    gradYear: document.getElementById('gradYear').value,
    skills: document.getElementById('skills').value,
    coverLetter: document.getElementById('coverLetter').value
  };
  
  await chrome.storage.local.set({ profileData });
  showStatus('Profile saved successfully!', 'success');
});


// Autofill button
document.getElementById("autofill-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const settings = await chrome.storage.local.get([
    "confirmFill",
    "autoTrack",
    "highlightFilled",
  ]);

  if (settings.confirmFill !== false) {
    if (!confirm("Fill the form on this page?")) return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    {
      action: "autofill",
      highlightFilled: settings.highlightFilled !== false,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        showStatus("Error: " + chrome.runtime.lastError.message, "error");
        return;
      }

      if (response && response.success) {
        showStatus(`Filled ${response.fieldsFilledCount} fields!`, "success");

        // Track application if enabled
        if (settings.autoTrack !== false) {
          trackApplication(tab.url, tab.title, response.fieldsFilledCount);
        }
      } else {
        showStatus("No fields found to fill", "error");
      }
    },
  );
});

// Track application
async function trackApplication(url, pageTitle, fieldsFilled) {
  const application = {
    url,
    pageTitle,
    fieldsFilled,
    timestamp: Date.now(),
    company: extractCompany(url, pageTitle),
    position: extractPosition(pageTitle),
  };

  const data = await chrome.storage.local.get("applicationHistory");
  const history = data.applicationHistory || [];
  history.unshift(application);

  // Keep last 500 applications
  if (history.length > 500) history.length = 500;

  await chrome.storage.local.set({ applicationHistory: history });
  loadHistory();
}

// Helper functions to extract company and position
function extractCompany(url, title) {
  // Extract from URL domain
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return (
        parts[parts.length - 2].charAt(0).toUpperCase() +
        parts[parts.length - 2].slice(1)
      );
    }
  } catch (e) {}

  // Try to extract from title
  const companyPatterns = [
    /at\s+([A-Z][a-zA-Z\s&]+)/i,
    /\|\s*([A-Z][a-zA-Z\s&]+)/,
  ];
  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }

  return "Unknown Company";
}

function extractPosition(title) {
  // Try to extract job title from page title
  const positionPatterns = [
    /([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Specialist))/,
    /^([^|-]+)/,
  ];

  for (const pattern of positionPatterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }

  return "Job Application";
}

// Load and display history
async function loadHistory() {
  const data = await chrome.storage.local.get("applicationHistory");
  const history = data.applicationHistory || [];

  document.getElementById("total-apps").textContent = history.length;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = history.filter((app) => app.timestamp > weekAgo).length;
  document.getElementById("this-week").textContent = thisWeek;

  const listContainer = document.getElementById("history-list");

  if (history.length === 0) {
    listContainer.innerHTML =
      '<div class="history-empty">No applications tracked yet</div>';
    return;
  }

  listContainer.innerHTML = history
    .map(
      (app) => `
    <div class="history-item">
      <div class="history-header">
        <div class="history-title">${escapeHtml(app.position)}</div>
        <div class="history-date">${formatDate(app.timestamp)}</div>
      </div>
      <div class="history-company">${escapeHtml(app.company)}</div>
      <a href="${escapeHtml(app.url)}" class="history-url" target="_blank" title="${escapeHtml(app.url)}">
        ${escapeHtml(app.url)}
      </a>
    </div>
  `,
    )
    .join("");
}

// Export history to CSV
document
  .getElementById("export-history")
  .addEventListener("click", async () => {
    const data = await chrome.storage.local.get("applicationHistory");
    const history = data.applicationHistory || [];

    if (history.length === 0) {
      showStatus("No history to export", "error");
      return;
    }

    const csv = [
      ["Date", "Position", "Company", "URL", "Fields Filled"],
      ...history.map((app) => [
        new Date(app.timestamp).toLocaleDateString(),
        app.position,
        app.company,
        app.url,
        app.fieldsFilled,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    downloadFile(csv, "job-applications.csv", "text/csv");
    showStatus("History exported!", "success");
  });

// Clear history
document.getElementById("clear-history").addEventListener("click", async () => {
  if (confirm("Delete all application history? This cannot be undone.")) {
    await chrome.storage.local.set({ applicationHistory: [] });
    loadHistory();
    showStatus("History cleared", "info");
  }
});

// Search history
document
  .getElementById("search-history")
  .addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const data = await chrome.storage.local.get("applicationHistory");
    const history = data.applicationHistory || [];

    const filtered = history.filter(
      (app) =>
        app.company.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.url.toLowerCase().includes(query),
    );

    const listContainer = document.getElementById("history-list");
    if (filtered.length === 0) {
      listContainer.innerHTML =
        '<div class="history-empty">No matching applications</div>';
      return;
    }

    listContainer.innerHTML = filtered
      .map(
        (app) => `
    <div class="history-item">
      <div class="history-header">
        <div class="history-title">${escapeHtml(app.position)}</div>
        <div class="history-date">${formatDate(app.timestamp)}</div>
      </div>
      <div class="history-company">${escapeHtml(app.company)}</div>
      <a href="${escapeHtml(app.url)}" class="history-url" target="_blank">
        ${escapeHtml(app.url)}
      </a>
    </div>
  `,
      )
      .join("");
  });

// Export profile data
document.getElementById("export-btn").addEventListener("click", async () => {
  const data = await chrome.storage.local.get("profileData");
  if (!data.profileData) {
    showStatus("No profile data to export", "error");
    return;
  }

  const json = JSON.stringify(data.profileData, null, 2);
  downloadFile(json, "job-autofill-profile.json", "application/json");
  showStatus("Profile exported!", "success");
});

// Import profile data
document.getElementById("import-data").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const profileData = JSON.parse(text);

    await chrome.storage.local.set({ profileData });
    loadProfile();
    showStatus("Profile imported successfully!", "success");
  } catch (error) {
    showStatus("Invalid file format", "error");
  }
});

// Load settings
async function loadSettings() {
  const data = await chrome.storage.local.get([
    "autoTrack",
    "confirmFill",
    "highlightFilled",
  ]);

  document.getElementById("auto-track").checked = data.autoTrack !== false;
  document.getElementById("confirm-fill").checked = data.confirmFill !== false;
  document.getElementById("highlight-filled").checked =
    data.highlightFilled !== false;
}

// Save settings
["auto-track", "confirm-fill", "highlight-filled"].forEach((id) => {
  document.getElementById(id).addEventListener("change", async (e) => {
    const key = id.replace("-", "");
    await chrome.storage.local.set({ [key]: e.target.checked });
    showStatus("Setting saved", "success");
  });
});

// Delete all data
document.getElementById("delete-all").addEventListener("click", async () => {
  if (
    confirm(
      "Delete ALL data including profile and history? This cannot be undone!",
    )
  ) {
    await chrome.storage.local.clear();
    loadProfile();
    loadHistory();
    showStatus("All data deleted", "info");
  }
});

// Utility functions
function showStatus(message, type = "info") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${type} show`;

  setTimeout(() => {
    status.classList.remove("show");
  }, 3000);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize
loadProfile();
loadHistory();
loadSettings();
