// Field matching logic - identifies what type of data each field needs

const FieldMatcher = {
  // Patterns for matching field types (all case-insensitive)
  patterns: {
    // Name fields
    prefix: /\b(prefix|title|salutation|honorific)\b/i,
    fullName:
      /\b(full[\s_-]?name|fullname|name|applicant[\s_-]?name|your[\s_-]?name|complete[\s_-]?name)\b/i,
    firstName:
      /\b(first[\s_-]?name|firstname|fname|given[\s_-]?name|forename)\b/i,
    middleName:
      /\b(middle[\s_-]?name|middlename|mname|middle[\s_-]?initial)\b/i,
    lastName: /\b(last[\s_-]?name|lastname|lname|surname|family[\s_-]?name)\b/i,
    preferredName: /\b(preferred[\s_-]?name|nickname|goes[\s_-]?by)\b/i,

    // Contact fields
    email:
      /\b(email|e[\s_-]?mail|e-mail|mail|contact[\s_-]?email|email[\s_-]?address)\b/i,
    phone:
      /\b(phone|telephone|mobile|cell|contact[\s_-]?(number|phone)|phone[\s_-]?number)\b/i,
    phoneDeviceType:
      /\b(phone[\s_-]?device[\s_-]?type|device[\s_-]?type|phone[\s_-]?type)\b/i,
    countryPhoneCode:
      /\b(country[\s_-]?phone[\s_-]?code|country[\s_-]?code|phone[\s_-]?code|calling[\s_-]?code|dial[\s_-]?code)\b/i,
    phoneExtension: /\b(phone[\s_-]?extension|extension|ext)\b/i,
    linkedin:
      /\b(linkedin|linked[\s_-]?in|linkedin[\s_-]?url|linkedin[\s_-]?profile)\b/i,
    portfolio:
      /\b(portfolio|website|personal[\s_-]?site|url|web[\s_-]?page|personal[\s_-]?website)\b/i,

    // Address fields
    addressLine1:
      /\b(address[\s_-]?line[\s_-]?1|address[\s_-]?1|street[\s_-]?address|address|street)\b/i,
    addressLine2:
      /\b(address[\s_-]?line[\s_-]?2|address[\s_-]?2|apt|apartment|suite|unit)\b/i,
    city: /\b(city|town|municipality)\b/i,
    province:
      /\b(province|state|territory|region|province[\s_-]?or[\s_-]?territory)\b/i,
    postalCode: /\b(postal[\s_-]?code|zip[\s_-]?code|zip|postcode|postal)\b/i,
    country: /\b(country|nation)\b/i,

    // Work experience fields
    currentTitle:
      /\b(current[\s_-]?title|job[\s_-]?title|position|role|current[\s_-]?position|your[\s_-]?title)\b/i,
    currentCompany:
      /\b(current[\s_-]?company|employer|organization|company[\s_-]?name|current[\s_-]?employer|company)\b/i,
    companyLocation:
      /\b(company[\s_-]?location|employer[\s_-]?location|work[\s_-]?location|location)\b/i,
    yearsExperience:
      /\b(years[\s_-]?(of[\s_-]?)?experience|experience[\s_-]?years|yoe|work[\s_-]?experience[\s_-]?years|total[\s_-]?experience)\b/i,
    jobStartDate:
      /\b(start[\s_-]?date|from[\s_-]?date|begin[\s_-]?date|employment[\s_-]?start|date[\s_-]?started)\b/i,
    jobEndDate:
      /\b(end[\s_-]?date|to[\s_-]?date|until|employment[\s_-]?end|date[\s_-]?ended)\b/i,
    roleDescription:
      /\b(role[\s_-]?description|job[\s_-]?description|responsibilities|duties|description)\b/i,
    summary:
      /\b(summary|about|bio|biography|overview|profile|cover[\s_-]?letter|why[\s_-]?you|tell[\s_-]?us|describe[\s_-]?yourself|about[\s_-]?yourself)\b/i,

    // Education fields
    university:
      /\b(university|college|school|institution|alma[\s_-]?mater|educational[\s_-]?institution|school[\s_-]?or[\s_-]?university)\b/i,
    degree:
      /\b(degree|education[\s_-]?level|highest[\s_-]?degree|qualification|education[\s_-]?qualification)\b/i,
    fieldOfStudy:
      /\b(major|field[\s_-]?of[\s_-]?study|study[\s_-]?area|specialization|concentration|area[\s_-]?of[\s_-]?study)\b/i,
    gpa: /\b(gpa|grade[\s_-]?point[\s_-]?average|overall[\s_-]?result|grades|academic[\s_-]?result)\b/i,
    eduStartYear:
      /\b(education[\s_-]?start|start[\s_-]?year|enrollment[\s_-]?year|from[\s_-]?year)\b/i,
    gradYear:
      /\b(graduation[\s_-]?year|grad[\s_-]?year|year[\s_-]?graduated|completion[\s_-]?year|to[\s_-]?year|end[\s_-]?year)\b/i,

    // Additional fields
    skills:
      /\b(skills|expertise|technologies|proficiencies|competencies|technical[\s_-]?skills)\b/i,
    hearAboutUs:
      /\b(hear[\s_-]?about[\s_-]?us|how[\s_-]?did[\s_-]?you[\s_-]?hear|source|referral[\s_-]?source)\b/i,
    socialMediaSource:
      /\b(social[\s_-]?media[\s_-]?source|social[\s_-]?media|media[\s_-]?source)\b/i,
    workedBefore:
      /\b(worked[\s_-]?before|previous[\s_-]?employee|worked[\s_-]?for|employed[\s_-]?before)\b/i,
    coverLetter:
      /\b(cover[\s_-]?letter|letter[\s_-]?of[\s_-]?interest|motivation[\s_-]?letter)\b/i,
  },

  // Normalize text - remove extra spaces, convert to lowercase
  normalize(text) {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
  },

  // Detect field type based on various attributes
  detectFieldType(field) {
    // Collect all possible identifiers
    const name = this.normalize(field.name || "");
    const id = this.normalize(field.id || "");
    const placeholder = this.normalize(field.placeholder || "");
    const label = this.normalize(this.getFieldLabel(field));
    const ariaLabel = this.normalize(field.getAttribute("aria-label") || "");
    const ariaDescribedBy = this.normalize(this.getAriaDescribedByText(field));

    // Combine all identifiers for searching
    const searchString = `${name} ${id} ${placeholder} ${label} ${ariaLabel} ${ariaDescribedBy}`;

    // Special handling for input types
    if (field.type === "email") return "email";
    if (field.type === "tel") return "phone";
    if (field.type === "url") {
      if (/linkedin/i.test(searchString)) return "linkedin";
      return "portfolio";
    }

    // Priority matching - check first name and last name before full name
    // This prevents firstName field from matching "name" pattern
    if (this.patterns.firstName.test(searchString)) return "firstName";
    if (this.patterns.lastName.test(searchString)) return "lastName";

    // Match against all other patterns
    for (const [fieldType, pattern] of Object.entries(this.patterns)) {
      if (fieldType === "firstName" || fieldType === "lastName") continue; // Already checked
      if (pattern.test(searchString)) {
        return fieldType;
      }
    }

    // Special cases for textareas (likely summary/cover letter)
    if (field.tagName === "TEXTAREA" && field.rows > 3) {
      return "summary";
    }

    return null;
  },

  // Get associated label text
  getFieldLabel(field) {
    // Check for label element
    if (field.labels && field.labels.length > 0) {
      return field.labels[0].textContent;
    }

    // Check for aria-labelledby
    const labelledBy = field.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent;
    }

    // Check for nearby label
    const parent = field.parentElement;
    if (parent) {
      const label = parent.querySelector("label");
      if (label) return label.textContent;

      // Check for text content in parent
      const parentText = parent.textContent.replace(field.value, "").trim();
      if (parentText.length > 0 && parentText.length < 100) return parentText;
    }

    // Check previous sibling
    const prevSibling = field.previousElementSibling;
    if (prevSibling && prevSibling.tagName === "LABEL") {
      return prevSibling.textContent;
    }

    return "";
  },

  // Get aria-describedby text
  getAriaDescribedByText(field) {
    const describedBy = field.getAttribute("aria-describedby");
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      if (descElement) return descElement.textContent;
    }
    return "";
  },

  // Split full name into first and last (used in contentScript)
  splitName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  },
};

// Make available globally
window.FieldMatcher = FieldMatcher;
