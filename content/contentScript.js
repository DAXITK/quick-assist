// Content script - runs on every page to detect and fill forms

// Listen for autofill command
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    performAutofill(request.highlightFilled)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function performAutofill(highlightFilled) {
  // Get profile data from storage
  const data = await chrome.storage.local.get('profileData');
  const profile = data.profileData;
  
  if (!profile) {
    throw new Error('No profile data found. Please set up your profile first.');
  }
  
  // Find all form fields
  const fields = document.querySelectorAll('input, textarea, select');
  let fieldsFilledCount = 0;
  
  for (const field of fields) {
    // Skip hidden, disabled, or read-only fields
    if (field.type === 'hidden' || field.disabled || field.readOnly) continue;
    if (field.offsetParent === null) continue; // Skip invisible elements
    
    // Detect field type
    const fieldType = window.FieldMatcher.detectFieldType(field);
    if (!fieldType) continue;
    
    // Handle name splitting if needed
    let value;
    if (fieldType === 'firstName') {
      value = window.FieldMatcher.splitName(profile.fullName || '').firstName;
    } else if (fieldType === 'lastName') {
      value = window.FieldMatcher.splitName(profile.fullName || '').lastName;
    } else {
      value = profile[fieldType];
    }
    
    if (!value) continue;
    
    // Fill the field
    const filled = fillField(field, value);
    if (filled) {
      fieldsFilledCount++;
      
      // Highlight if requested
      if (highlightFilled) {
        highlightField(field);
      }
    }
  }
  
  return {
    success: true,
    fieldsFilledCount
  };
}

function fillField(field, value) {
  try {
    // Store original value
    const originalValue = field.value;
    
    // Set focus
    field.focus();
    
    // Handle different field types
    if (field.tagName === 'SELECT') {
      // Find matching option
      const options = Array.from(field.options);
      const match = options.find(opt => 
        opt.value.toLowerCase().includes(value.toLowerCase()) ||
        opt.text.toLowerCase().includes(value.toLowerCase())
      );
      
      if (match) {
        field.value = match.value;
      } else {
        return false;
      }
    } else {
      // Regular input or textarea
      field.value = value;
    }
    
    // Trigger events to notify frameworks (React, Angular, etc.)
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new Event('blur', { bubbles: true })
    ];
    
    events.forEach(event => field.dispatchEvent(event));
    
    // Also trigger keyup for some forms
    const keyupEvent = new KeyboardEvent('keyup', { bubbles: true });
    field.dispatchEvent(keyupEvent);
    
    return field.value !== originalValue;
  } catch (error) {
    console.error('Error filling field:', error);
    return false;
  }
}

function highlightField(field) {
  const originalBorder = field.style.border;
  const originalBackground = field.style.backgroundColor;
  
  field.style.border = '2px solid #34a853';
  field.style.backgroundColor = '#e6f4ea';
  
  setTimeout(() => {
    field.style.border = originalBorder;
    field.style.backgroundColor = originalBackground;
  }, 2000);
}

// Add visual indicator when extension is active
function addExtensionIndicator() {
  if (document.getElementById('autofill-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'autofill-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    padding: 10px 16px;
    border-radius: 24px;
    font-size: 12px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s;
  `;
  indicator.innerHTML = '🚀 Autofill Ready';
  indicator.title = 'Click extension icon to fill this form';
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.05)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(indicator);
  
  // Remove after 5 seconds
  setTimeout(() => {
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 300);
  }, 5000);
}

// Show indicator if form detected on page
if (document.querySelector('form')) {
  addExtensionIndicator();
}
