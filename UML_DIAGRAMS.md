# DistroFlow CRM — Complete UML & System Architecture Diagrams

This document provides production-grade UML diagrams modeling the complete architecture, data models, state machines, and business workflows of the **DistroFlow** platform. All diagrams use standard Mermaid syntax and are ready to be included directly in project documentation, evaluation reports, or thesis papers.

---

## Table of Contents
1. [Entity-Relationship (ER) Diagram](#1-entity-relationship-er-diagram)
2. [Class Diagram (Object-Oriented Architecture)](#2-class-diagram)
3. [Core Flowchart: Order Placement & Automated Backordering](#3-core-flowchart-order-placement--automated-backordering)
4. [State Machine Diagram: Order Fulfillment Pipeline](#4-state-machine-diagram-order-fulfillment-pipeline)
5. [Sequence Diagram: End-to-End Order & Credit Lifecycle](#5-sequence-diagram-end-to-end-order--credit-lifecycle)
6. [Activity Diagram: Inbound Restock & Backorder Allocation](#6-activity-diagram-inbound-restock--backorder-allocation)

---

## 1. Entity-Relationship (ER) Diagram

Represents the physical SQLite database schema managed through Prisma ORM. Models strict primary-to-foreign key relationships, cascade rules, and role associations.

```mermaid
erDiagram
    USER ||--o| STAFF_PROFILE : "has profile"
    USER ||--o| RETAILER : "linked account"
    USER ||--o{ ORDER : "places (Sales)"
    USER ||--o{ ORDER : "packs (Warehouse)"
    USER ||--o{ ORDER : "delivers (Fleet)"
    USER ||--o{ PAYMENT : "collects (Accountant)"
    USER ||--o{ AUDIT_LOG : "triggers"

    RETAILER ||--o{ ORDER : "owns"
    RETAILER ||--o{ PAYMENT : "makes"

    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER ||--o{ PAYMENT : "settled by"

    PRODUCT ||--o{ ORDER_ITEM : "itemizes"

    USER {
        string id PK
        string name
        string email UK
        string passwordHash
        string role "distributor | sales_exec | warehouse_manager | accountant | delivery_person | retailer"
        string phone
        string avatarUrl
        datetime createdAt
    }

    STAFF_PROFILE {
        string id PK
        string userId FK, UK
        string zone "North | South | East | West | Central"
        float salary
        float commissionPercent
        string status "active | inactive"
        datetime hiredOn
    }

    RETAILER {
        string id PK
        string userId FK, UK
        string shopName
        string ownerName
        string email
        string phone
        string gstNo UK
        string address
        string city
        string zone "North | South | East | West | Central"
        float creditLimit
        float outstandingBalance
        string tag "Premium | Standard | High Risk | New"
        string status "active | inactive | blocked"
        string assignedSalesExecId FK
        datetime createdAt
    }

    PRODUCT {
        string id PK
        string sku UK
        string name
        string category "Beverages | Foods | Personal Care | Household | Dairy"
        string unit "Case | Carton | Pack | Box | Unit"
        float price
        float taxPercent
        int stockQty
        int reorderThreshold
        string warehouseLocation
        string imageUrl
        datetime createdAt
    }

    ORDER {
        string id PK "ORD-YYYYMM-XXXX"
        string retailerId FK
        string status "Placed | Confirmed | Packed | Dispatched | Delivered | Cancelled"
        string paymentStatus "Unpaid | Partial | Paid | Overdue"
        float subtotal
        float taxAmount
        float totalAmount
        float paidAmount
        boolean hasBackorder
        string notes
        string deliveryZone
        string placedByStaffId FK
        string packedByStaffId FK
        string deliveredByStaffId FK
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        int qty
        int fulfilledQty
        int backorderedQty
        float unitPrice
        float totalPrice
    }

    PAYMENT {
        string id PK "PAY-YYYY-XXXX"
        string retailerId FK
        string orderId FK
        float amount
        string mode "UPI | Cash | Bank Transfer | Cheque"
        string referenceNo
        datetime date
        string status "Completed | Pending | Failed"
        string collectedByStaffId FK
    }

    AUDIT_LOG {
        string id PK
        string userId FK
        string userName
        string userRole
        string action
        string entity
        string details
        datetime timestamp
    }

    NOTIFICATION {
        string id PK
        string targetRole "all | distributor | sales_exec | warehouse_manager | accountant | delivery_person | retailer"
        string userId
        string title
        string message
        string type "order | stock | payment | system"
        boolean read
        datetime createdAt
    }
```

---

## 2. Class Diagram

Illustrates the object-oriented structure of the backend application, showing controller services, middleware security wrappers, and database models.

```mermaid
classDiagram
    class AuthMiddleware {
        +authenticateJWT(req, res, next)
        +verifyToken(token) string
    }

    class RBACMiddleware {
        -allowedRoles: string[]
        +requireRoles(allowedRoles) Function
        +checkPermission(userRole, requiredRole) boolean
    }

    class OrderController {
        +getOrders(filters) Order[]
        +getOrderById(orderId) Order
        +placeOrder(orderData) Order
        +updateStatus(orderId, newStatus, user) Order
        +getBackorderQueue() OrderItem[]
    }

    class InventoryService {
        +checkStockAvailability(productId, requestedQty) StockCheckResult
        +decrementStock(productId, qty) boolean
        +replenishStock(productId, qty, notes) Product
        +allocateBackorders(productId, newQty) int
    }

    class CreditLedgerService {
        +verifyCreditLimit(retailerId, orderTotal) CreditCheckResult
        +recordPayment(retailerId, orderId, amount, mode, staffId) Payment
        +computeAgingReport() AgingSummary
        +sendPaymentReminder(retailerId) boolean
    }

    class AuditLogger {
        +recordLog(actor, role, action, entity, details) void
        +getLogs(searchQuery, roleFilter) AuditLog[]
    }

    class NotificationService {
        +dispatchAlert(targetRole, title, message, type) void
        +markAsRead(userId, role) void
    }

    class Order {
        +string id
        +string retailerId
        +string status
        +float totalAmount
        +boolean hasBackorder
        +OrderItem[] items
        +calculateTotals() void
    }

    class OrderItem {
        +string id
        +string productId
        +int qty
        +int fulfilledQty
        +int backorderedQty
        +float totalPrice
    }

    class Retailer {
        +string id
        +string shopName
        +float creditLimit
        +float outstandingBalance
        +string status
        +hasCreditAvailable(amount) boolean
    }

    AuthMiddleware ..> RBACMiddleware : invokes
    RBACMiddleware ..> OrderController : guards
    OrderController --> InventoryService : checks stock & backorders
    OrderController --> CreditLedgerService : validates credit limit
    OrderController --> AuditLogger : logs transitions
    OrderController --> NotificationService : emits alerts
    OrderController *-- Order : manages
    Order *-- OrderItem : contains
    CreditLedgerService --> Retailer : updates balance
```

---

## 3. Core Flowchart: Order Placement & Automated Backordering

Visualizes the core algorithmic logic of DistroFlow: how credit risk is mitigated and how zero/insufficient inventory is automatically split into backorders without rejecting the sale.

```mermaid
flowchart TD
    Start([Retailer / Sales Exec Initiates Order]) --> InputItems[Select Product SKUs and Quantities]
    InputItems --> FetchRetailer[Fetch Retailer Credit Limit & Outstanding Balance]

    FetchRetailer --> CreditCheck{Outstanding + Order Total > Credit Limit?}
    CreditCheck -- YES (Exceeded) --> BlockOrder[Block Order: Return 400 Bad Request<br/>Notify Retailer to Settle Outstanding Balance]
    BlockOrder --> EndFailed([Transaction Terminated])

    CreditCheck -- NO (Approved) --> LoopItems[Iterate Through Each Order Item]

    LoopItems --> StockCheck{Product Stock >= Requested Qty?}

    StockCheck -- YES (Full Stock) --> FulfillFull[fulfilledQty = requestedQty<br/>backorderedQty = 0<br/>stockQty = stockQty - fulfilledQty]

    StockCheck -- NO (Stockout / Partial) --> SplitBackorder[fulfilledQty = max 0, stockQty<br/>backorderedQty = requestedQty - fulfilledQty<br/>stockQty = 0<br/>Set order.hasBackorder = true]

    FulfillFull --> NextItem{More Items in Cart?}
    SplitBackorder --> NextItem

    NextItem -- YES --> LoopItems
    NextItem -- NO --> SaveOrder[Persist Order & OrderItems in DB]

    SaveOrder --> IncDebt[Update Retailer Outstanding Debt<br/>balance = balance + totalAmount]
    IncDebt --> WriteAudit[Record Immutable Audit Log Entry]

    WriteAudit --> CheckBackorderFlag{hasBackorder == true?}

    CheckBackorderFlag -- YES --> AlertProcure[Dispatch Notification to Warehouse Manager & Distributor:<br/>New Backorder Waiting for Inbound Restock]
    CheckBackorderFlag -- NO --> AlertWarehouse[Dispatch Notification to Warehouse:<br/>Order Ready for Picking & Packing]

    AlertProcure --> FinishSuccess([Order Confirmed: Status = Placed])
    AlertWarehouse --> FinishSuccess
```

---

## 4. State Machine Diagram: Order Fulfillment Pipeline

Models the lifecycle of an order and which organizational role owns each stage transition. Unauthorized roles attempting transitions are blocked by backend RBAC middleware.

```mermaid
stateDiagram-v2
    [*] --> Placed : Created by Retailer or Sales Exec (Field Visit)
    
    Placed --> Confirmed : Distributor / Sales Exec verifies terms
    Placed --> Cancelled : Distributor / Sales Exec cancels

    Confirmed --> Packed : Warehouse Manager picks items from bays & marks Packed
    note right of Packed
        handled_by: Warehouse Lead ID logged
        Fleet manifest automatically updated
    end note

    Packed --> Dispatched : Delivery Person loads van & dispatches route
    note right of Dispatched
        Assigned Delivery Staff ID recorded
        Retailer receives dispatch notification
    end note

    Dispatched --> Delivered : Delivery Person completes drop-off (Signed)
    note right of Delivered
        Timestamp logged
        Invoice archived in Retailer Statement
    end note

    Dispatched --> Cancelled : Delivery Rejected / Returned
    Confirmed --> Cancelled : Cancelled before packing

    Delivered --> [*]
    Cancelled --> [*]
```

---

## 5. Sequence Diagram: End-to-End Order & Credit Lifecycle

Tracks interactions across system boundaries from store order creation to warehouse packing, delivery dispatch, and accountant payment reconciliation.

```mermaid
sequenceDiagram
    autonumber
    actor Retailer as Retailer (Apex Mart)
    participant Client as Frontend Web (React)
    participant API as Express API Server
    participant RBAC as RBAC & Auth Guard
    participant DB as SQLite (Prisma ORM)
    actor Warehouse as Warehouse Manager
    actor Fleet as Delivery Driver
    actor Accountant as Senior Accountant

    Retailer->>Client: Adds 10x Tata Tea (Stock: 10) & 5x Red Bull (Stock: 0)
    Retailer->>Client: Clicks "Confirm Order"
    Client->>API: POST /api/orders {retailerId, items} (Bearer JWT)
    API->>RBAC: Verify JWT token & role validity
    RBAC-->>API: Authorized (Role: Retailer)

    API->>DB: Query Retailer credit limit & current outstanding debt
    DB-->>API: Limit = ₹250,000 | Current = ₹68,500 | Order = ₹24,000
    Note over API: Credit Check Passed: ₹92,500 <= ₹250,000

    Note over API: Backorder Engine:<br/>Tata Tea: Fulfilled = 10, Backorder = 0<br/>Red Bull: Fulfilled = 0, Backorder = 5
    API->>DB: Save Order (hasBackorder: true), OrderItems, Decrement stock
    API->>DB: Increment Retailer outstanding balance (+₹24,000)
    API->>DB: Insert Audit Log: ORDER_PLACED
    API-->>Client: 201 Created (Order #ORD-202609-1051)
    Client-->>Retailer: Display confirmation + Backorder notification

    par Fleet & Warehouse Alerts
        API->>Warehouse: Alert: Order #ORD-202609-1051 Ready to Pack & Red Bull Backordered
    end

    Warehouse->>API: PATCH /api/orders/ORD-202609-1051/status {status: "Packed"}
    API->>DB: Update status to "Packed", record packedByStaffId
    API-->>Warehouse: Status updated

    Fleet->>API: PATCH /api/orders/ORD-202609-1051/status {status: "Delivered"}
    API->>DB: Update status to "Delivered", record deliveredByStaffId
    API-->>Fleet: Delivery timestamp recorded

    Note over Accountant: 15 Days Later (Invoice Due Date)
    Accountant->>API: POST /api/payments {retailerId, amount: 24000, mode: "UPI"}
    API->>DB: Save Payment record (collectedByStaffId: Accountant)
    API->>DB: Decrement Retailer outstanding debt (-₹24,000)
    API->>DB: Update Order paymentStatus to "Paid"
    API-->>Accountant: Payment recorded, credit limit restored
```

---

## 6. Activity Diagram: Inbound Restock & Backorder Allocation

Illustrates how inbound shipments automatically satisfy queued backorders without requiring manual re-entry.

```mermaid
flowchart TD
    A([Inbound Shipment Arrives at Dock]) --> B[Warehouse Manager Opens 'Stock Intake' Modal]
    B --> C[Enter Received Units & Location: e.g. +50 units Red Bull]
    C --> D[System Updates Product stockQty in DB]
    D --> E[Query Database for Pending Backorders on this SKU]

    E --> F{Any Backorder Items Pending?}

    F -- NO --> G[Normal Stock Increase Complete]
    G --> EndDone([Bayside Inventory Ready])

    F -- YES --> H[Sort Pending Orders by Creation Date: FIFO]
    H --> I[Allocate Inbound Stock to Fulfill Backordered Quantities]
    I --> J[Update OrderItem: fulfilledQty += backorderedQty, backorderedQty = 0]
    J --> K{Are all items in Order now fulfilled?}

    K -- YES --> L[Set order.hasBackorder = false<br/>Move Order to Pack Queue]
    K -- NO --> M[Keep partial backorder flag]

    L --> N[Send Real-Time Alert to Warehouse Manager:<br/>'Backorder Order Ready for Packing']
    M --> N
    N --> EndDone
```
