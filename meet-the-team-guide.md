# Meet the Team - Codebase Overview

This document outlines the code and files connected to the **"Meet the Team"** section on the Eridan Games website. This section features a dynamic grid of team members that, when clicked, opens an interactive "Character Sheet" modal.

---

## 1. Structure (HTML)
The main container for the team section is located in `about.html`. It serves as the hook for the dynamic loader.

**File:** `h:\ERIDAN\web-site\about.html` (Lines 101-109)
```html
<!-- Meet the Team -->
<section class="team-section">
    <div class="section-header">
        <h2>Meet the Team</h2>
        <p>The creative minds behind Eridan Games, bringing diverse talents and shared passion to every project. In order of joining:</p>
    </div>
    <div id="team-members-container" class="team-members-grid">
        <!-- Team members will be loaded dynamically here -->
    </div>
</section>
```

---

## 2. Styling (CSS)
The visual representation of the team grid and the individual "member circles" are defined in the main stylesheet.

**File:** `h:\ERIDAN\web-site\css\styles.css` (Lines 2994-3045)
```css
.team-member-circle {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
    margin: 1rem 2rem 0rem;
}

.team-member-circle:hover {
    transform: scale(1.05);
}

.team-member-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--accent-teal);
    margin-bottom: 1rem;
    transition: border-color 0.3s ease;
    cursor: pointer;
}

.team-member-circle:hover .team-member-avatar {
    border-color: var(--accent-gold);
}

.team-member-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.team-member-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--accent-green);
    text-align: center;
    margin: 0;
    margin-top: 0.75rem;
}

.team-member-class {
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--text-secondary);
    text-align: center;
    margin: 0;
    margin-top: 0.25rem;
    font-style: italic;
    max-width: 150px;
}
```

---

## 3. Dynamic Loading (JavaScript)
The section is populated at runtime by reading JSON data files. This allows for easy updates without modifying the HTML structure.

**File:** `h:\ERIDAN\web-site\js\team-loader.js`
*   **Purpose:** Fetches `team.json`, iterates through member files, and renders the HTML for each member.
*   **Key Function:** `createMemberElement(member)` builds the circular avatar and adds the click listener to open the modal.

---

## 4. Interaction (Character Sheets)
When a team member's avatar is clicked, a "Character Sheet" modal is triggered.

**File:** `h:\ERIDAN\web-site\js\character-sheet.js`
*   **Purpose:** Manages the modal's lifecycle (Open/Close) and populates it with the specific member's data.
*   **Aesthetics:** Includes a custom `modal-starfield` canvas animation for a premium feel.

**File:** `h:\ERIDAN\web-site\css\character-sheet.css`
*   **Purpose:** Contains the layout for the modal, including the RPG-inspired "Character Sheet" design.

---

## 5. Data (Content)
The team roster and individual biographies are stored as JSON files.

**Directory:** `h:\ERIDAN\web-site\content\team\`

*   **`team.json`**: Lists the order of team members to display.
    ```json
    [
      "dino.json",
      "tomislav.json",
      "borjan.json",
      ...
    ]
    ```
*   **Individual JSONs (e.g., `dino.json`)**: Contains details like:
    - `id`, `name`, `class` (Role)
    - `vibe`, `avatar` (Image path)
    - `backstory`, `strengths`, `weaknesses`, `proficiencies`
    - `currentQuest`
