# Design System: Capital Optimization & Risk Control Platform

## 1. Design Philosophy
The platform is built for high-profile financial officers, risk managers, and treasury teams. The aesthetic must communicate **trust, clarity, sophistication, and extreme precision**. 

We will use a **High-Contrast Monochrome (Black & White)** theme. By stripping away unnecessary colors, the interface forces the user's attention strictly onto the data, insights, and critical actions.

**Core Principles:**
- **Minimalist & Clean:** Zero clutter. Every pixel must serve a purpose.
- **Data-First:** Content is king. Typography and spacing do the heavy lifting.
- **High Signal-to-Noise:** Color is reserved *exclusively* for critical status indicators (e.g., risk breaches).

---

## 2. Color Palette

The core interface relies entirely on grayscale to feel premium and institutional. 

### Base Monochrome
*   **Background (Primary):** `#FFFFFF` (Pure White) - For maximum cleanliness and readability.
*   **Background (Secondary):** `#FAFAFA` (Off-White) - For subtle separation (e.g., sidebars, cards).
*   **Surface (Cards/Modals):** `#FFFFFF` with a very subtle, sharp drop shadow or a 1px solid `#EAEAEA` border.
*   **Text (Primary):** `#111111` (Near Black) - For headings and primary data points. Avoid `#000000` to reduce eye strain.
*   **Text (Secondary):** `#666666` (Medium Gray) - For labels, descriptions, and secondary metrics.
*   **Borders & Dividers:** `#E5E5E5` (Light Gray) - Keep them thin (1px) and crisp.

### The "Exception" Colors (Status & Alerts)
Because the app is black and white, when a color *is* used, it commands immediate attention.
*   **Safe / Optimal (🟢):** `#000000` (We don't need green for safe, just keep it sleek black, OR use a very muted, sophisticated dark green `#1E392A` if absolutely necessary for compliance).
*   **Warning / Breach (🔴):** `#D32F2F` (Crimson Red) - Used *only* when a risk limit is breached or a critical action is required.
*   **Action / Primary Button:** `#111111` (Near Black) with `#FFFFFF` text. (Hover state: `#333333`).

---

## 3. Typography

Typography is the most important design element in a monochrome theme. We need a modern, geometric sans-serif that looks like a high-end editorial or modern fintech app.

*   **Primary Font:** **Inter** or **Geist** (Clean, highly legible for numbers, modern).
*   **Secondary Font (Monospace for Data):** **JetBrains Mono** or **Geist Mono** (For financial figures, tickers, and percentages. Aligns decimals perfectly).

### Typographic Hierarchy
*   **Page Title (H1):** 32px, Semi-Bold, `#111111`, tight tracking (-0.02em).
*   **Section Header (H2):** 20px, Medium, `#111111`.
*   **Body Text:** 14px, Regular, `#666666`, line-height 1.5.
*   **Data Highlights (The "Big Numbers"):** 48px, Light or Regular, `#111111`. (e.g., Total Portfolio Value).
*   **Small Labels:** 12px, Medium, All-Caps, `#888888`, wide tracking (+0.05em).

---

## 4. UI Components & Styling

### Buttons
Sharp, structured, and authoritative. No pill shapes.
*   **Primary Button:** Solid near-black background (`#111111`), white text, 4px border radius (sharp but not aggressive).
*   **Secondary Button:** Transparent background, 1px solid near-black border (`#111111`), near-black text.
*   **Disabled Button:** Solid `#E5E5E5` background, `#A3A3A3` text.

### Cards & Containers
*   **Style:** Flat. No heavy shadows. Use a 1px `#EAEAEA` border.
*   **Padding:** Generous padding (e.g., 24px or 32px). Let the data breathe. White space represents luxury and clarity.

### Data Tables
*   **Header Row:** 12px, All-Caps, `#888888`, 1px bottom border `#111111` (strong anchor).
*   **Rows:** 14px text. Zebra striping should be avoided. Use simple 1px `#F0F0F0` bottom borders between rows.
*   **Hover State:** Subtle `#F9F9F9` background on row hover.

---

## 5. Visualizing Data in Black & White

Data visualizations must rely on contrast, patterns, or shades of gray rather than a rainbow of colors.

*   **Donut / Pie Charts (Allocation):** Use varying shades of gray (e.g., `#111111`, `#444444`, `#777777`, `#AAAAAA`, `#D4D4D4`). Use a thin 2px white stroke between slices for crisp separation.
*   **Line Charts (Performance over time):** A single, bold `#111111` 2px line. For comparison lines (e.g., benchmark), use a dotted or dashed `#888888` line.
*   **Bar Charts (Risk vs Return):** Solid near-black bars for actuals, outlined bars for targets or limits.

---

## 6. The User Journey (Visual Experience)

1.  **Dashboard Load:** The screen fades in. Crisp typography over vast white space. The total portfolio value sits massive on the top left.
2.  **Optimal State:** The dashboard feels calm. Black text, white backgrounds, thin gray lines. Everything is mathematically sound.
3.  **Risk Breach Event:** A sharp contrast occurs. A specific card's border turns crimson (`#D32F2F`). A red alert icon appears. Because the rest of the app is monochrome, this single red element immediately draws the user's eye to the exact point of failure and the "Rebalance" call-to-action.
4.  **Action Taken:** Upon clicking "Rebalance", a sleek modal slides in with the transaction cost vs. benefit analysis presented in a crisp, mono-spaced table.

---

## 7. Developer Implementation Notes (Tailwind CSS)

If using Tailwind, your `tailwind.config.js` should reflect this discipline:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        institutional: {
          900: '#111111', // Primary Text, Primary Buttons
          800: '#333333', // Hover states
          600: '#666666', // Secondary Text
          400: '#A3A3A3', // Disabled text
          200: '#EAEAEA', // Borders
          100: '#F9F9F9', // Table hovers, subtle backgrounds
          50:  '#FFFFFF', // Base background
        },
        alert: {
          DEFAULT: '#D32F2F', // Only used for breaches
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px', // Keep it sharp
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    }
  }
}
```
