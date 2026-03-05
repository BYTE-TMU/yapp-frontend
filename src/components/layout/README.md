### Overview

This directory contains the layout components for the application.

### Components

**AuthRoutesLayout**: The layout for authenticated routes.

**Purpose**: This component is a wrapper for all authenticated routes. It provides a consistent layout for all pages that require authentication. It includes the header navigation bar, the main content area, the sidebar, and the bottom menu bar.

**Key Features**:

- Header Navigation Bar
- Main Content Area
- Sidebar
- Bottom Navigation Bar
- Responsive design
- Mobile-first approach

**Usage Guidelines**:

- This component has already been added to the AuthRoutes component, so you don't need to add it manually.
- This component is used as a layout element and as such, all elements nested within it is rendered within the **Outlet** component.
- When creating a new page, ensure that the page's outer most container uses the class **page-container** to ensure that the page is properly centered, has the correct padding, and is responsive.
- Ensure that the page and route is declared within the AuthRoutes page under the AuthRoutesLayout component and you will be good to go 
