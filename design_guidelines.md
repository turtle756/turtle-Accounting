# Design Guidelines: GitHub-Based Accounting System

## Design Approach
**Selected: Design System Hybrid** - Drawing from financial management leaders (YNAB, Wave Accounting, Expensify) with Material Design principles for data-dense interfaces. This application prioritizes clarity, trust, and efficient data entry over visual flair.

## Typography
- **Primary Font**: Inter (Google Fonts) - excellent for numbers and data tables
- **Hierarchy**:
  - Page Headers: text-3xl font-bold (Dashboard, Reports)
  - Section Headers: text-xl font-semibold (Monthly Overview, Budget Categories)
  - Card Titles: text-lg font-medium
  - Body/Data: text-base font-normal
  - Small Labels: text-sm text-gray-600
  - Numbers: tabular-nums (monospace numbers for alignment)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Container: max-w-7xl mx-auto px-4
- Section Padding: py-6 (mobile) to py-8 (desktop)
- Card Padding: p-6
- Form Field Spacing: gap-4 between fields, gap-6 between sections
- Table Cell Padding: px-4 py-3

## Component Library

### Navigation
Fixed top navigation bar with:
- Logo/App Name (left)
- Desktop: Horizontal menu (Dashboard, Input, History, Budget, Reports)
- Mobile: Hamburger menu with slide-out drawer
- GitHub token status indicator (right) with connected/disconnected state

### Dashboard Cards
Three-column grid (1 col mobile, 3 cols desktop) for summary metrics:
- Card structure: Subtle border, slight shadow on hover
- Icon + Label + Large Number format
- Balance card shows trend indicator (up/down arrow with percentage)
- Monthly breakdown: 12-card grid (2 cols mobile, 4 cols desktop) with budget progress bars

### Input Forms
Two-tab interface (Income/Expense) with:
- Tab pills with active state underline
- Form fields in vertical stack with clear labels above inputs
- Category dropdown with grouping (for expenses)
- Camera upload button with icon and "Upload Receipt" text
- Preview thumbnail below upload when image selected
- Submit button: Full-width on mobile, right-aligned on desktop

### Transaction History Table
Responsive table pattern:
- Desktop: Full table with columns (Date, Title, Category, Amount, Receipt, Actions)
- Mobile: Card-based layout stacking information vertically
- Search bar: Sticky above table with icon prefix
- Filter dropdowns: Inline on desktop, collapsible panel on mobile
- Receipt icon: Camera icon that opens modal on click
- Actions: Edit (pencil icon) and Delete (trash icon) buttons
- Alternating row background for readability

### Budget Settings Interface
Accordion-style category groups:
- Add Category button with plus icon
- Each category row: Name input, Budget amount input, Delete button
- Save button: Prominent, right-aligned

### Reports Page
Print-optimized layout:
- Month selector dropdown at top
- Category spending cards in grid format
- Horizontal bar charts comparing spent vs budget
- "Generate Print View" button that reveals formal report template
- Print view: Clean typography, minimal borders, suitable for PDF export

### Modals
Receipt viewer modal:
- Dark overlay (backdrop-blur-sm)
- Centered white card with close button
- Full-width image display with filename and date below

## Images
**No large hero image.** This is a data-focused application where screen real estate is precious.

Instead, use:
- Small illustrative icons throughout (from Heroicons via CDN)
- Currency/calculation themed accent graphics in empty states
- Receipt thumbnails as primary visual content
- Optional: Small decorative graphic in header area (piggy bank or ledger icon)

## Mobile-First Considerations
- Bottom navigation bar on mobile for quick access to Dashboard, Input, History
- Large touch targets (minimum 44px height)
- Simplified table views with expandable rows
- Camera access directly from expense input
- Sticky headers for scrollable content

## Data Visualization
- Budget progress bars: Show percentage filled with clear remaining amount
- Use green (positive/income), red (negative/expense), blue (neutral/budget)
- Category spending charts: Horizontal bars for easy comparison
- Trend indicators: Simple arrows with subtle background fills

## Accessibility
- All form inputs with associated labels
- Error states with red borders and helper text
- Success confirmations with toast notifications
- ARIA labels for icon-only buttons
- Keyboard navigation support throughout