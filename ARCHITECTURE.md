# Beidar POS - System Architecture

## Overview
Beidar POS is a robust, modern Point of Sale (POS) and Inventory Management system built to be offline-first and fast. It addresses the needs of small to medium businesses by providing a comprehensive suite of tools for sales, inventory, customers, suppliers, expenses, and comprehensive reporting.

## Technology Stack

The application uses the **Wails** framework, combining a high-performance Go backend with a modern React/TypeScript frontend. 

### Backend
- **Language**: Go
- **Framework**: Wails (v2)
- **Database**: SQLite
- **ORM**: GORM
- **Authentication**: Bcrypt for local password hashing
- **Architecture Pattern**: Clean Architecture (Domain -> Repository -> Service -> Handler)

### Frontend
- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with arbitrary variables and custom brand colors)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

## Architectural Layers (Backend)

The Go backend follows a variation of clean architecture to decouple business logic from infrastructure.

1. **Domain (`internal/domain`)**: Contains core entity definitions (`Product`, `Sale`, `Customer`, etc.) and basic structural validation. Contains NO dependencies on other layers.
2. **Repository (`internal/repository`)**: Interfaces for data access. The `sqlite` package implements these interfaces, handling the raw GORM logic and transactions.
3. **Service (`internal/service`)**: Contains the core business logic. Validates models before saving and orchestrates multi-table actions (e.g., `ProcessPartialReturn`, `HandleReceivedOrder`).
4. **Handler (`internal/handler`)**: Wails binding points. `App.go` exposes service methods to the frontend JS context via Wails bindings.

## Core Workflows

### 1. Sales & Stock Deduction
- `SaleService.CreateSale` validates the cart.
- It deducts the `Stock` for each selected product before completing the transaction.
- If a part of the sale is returned later, `SaleService.ProcessPartialReturn` restores the matched stock amount, recalculates the subtotal/discount, and updates customer debt proportionally.

### 2. Purchase Orders
- Facilitates buying items from suppliers.
- A `PurchaseOrder` starts as `pending`. 
- When transitioned to `received` via `PurchaseOrderService.ReceiveOrder()`, the system calculates a **Weighted Average Cost** and adds the quantity to the product's available `Stock`.

### 3. Role-Based Access Control (RBAC)
- Staff accounts have different roles: `admin`, `manager`, `cashier`.
- The frontend `authStore` evaluates permissions (`can('delete_sales')`) to show or hide sensitive actions.
- Backend `App` handlers rely on authenticated requests (though currently managed via frontend gates for simplicity in a local app).

## Frontend Structure

- `src/components/ui/`: Reusable, dumb UI components (Buttons, Modals, Inputs, EmptyStates).
- `src/components/features/`: Complex widgets bound to application state (CommandPalette, PartialReturnDialog, PurchaseOrderForm).
- `src/components/layout/`: Shell elements like Sidebar and MainLayout.
- `src/pages/`: Major application views.
- `src/store/`: Zustand stores dividing global state by domain (e.g. `authStore`, `salesStore`, `purchaseOrderStore`).
- `src/types/`: Strict TypeScript definitions mapping exactly to the backend JSON responses.

## Activity Logging
Sensitive or notable actions (e.g. returns, deleting sales, making purchase orders) trigger local logs via `useActivityLog`. This improves accountability and allows admins to track modifications easily.

## Future Recommendations
1. **Network Syncing**: Expand the SQLite architecture to bi-directional syncing if multi-device cloud backup becomes necessary.
2. **E2E Testing**: Add a suite of Playwright tests for complex flows (Cart -> Checkout -> Print Receipt).
3. **Wails V3**: Consider migration to Wails v3 when stable to get better multi-window and native integration features.
