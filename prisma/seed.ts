import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing records in SQLite...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Creating demo users and staff profiles...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Distributor (Owner/Admin)
  const owner = await prisma.user.create({
    data: {
      name: 'Vikram Mehta',
      email: 'owner@distroflow.com',
      passwordHash,
      role: 'distributor',
      phone: '+91 98200 11223',
    },
  });

  // 2. Staff: Sales Executives
  const sales1 = await prisma.user.create({
    data: {
      name: 'Rohit Sharma',
      email: 'sales.rohit@distroflow.com',
      passwordHash,
      role: 'sales_exec',
      phone: '+91 98201 44556',
      staffProfile: {
        create: {
          zone: 'North',
          salary: 45000,
          commissionPercent: 2.5,
          status: 'active',
        },
      },
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      name: 'Suresh Raina',
      email: 'sales.suresh@distroflow.com',
      passwordHash,
      role: 'sales_exec',
      phone: '+91 98202 77889',
      staffProfile: {
        create: {
          zone: 'South',
          salary: 42000,
          commissionPercent: 2.5,
          status: 'active',
        },
      },
    },
  });

  // 3. Staff: Warehouse Managers
  const warehouseLead = await prisma.user.create({
    data: {
      name: 'Anil Kumar',
      email: 'warehouse.anil@distroflow.com',
      passwordHash,
      role: 'warehouse_manager',
      phone: '+91 98203 12345',
      staffProfile: {
        create: {
          zone: 'Central',
          salary: 50000,
          commissionPercent: 0,
          status: 'active',
        },
      },
    },
  });

  const warehouseStaff = await prisma.user.create({
    data: {
      name: 'Manoj Bajpai',
      email: 'warehouse.manoj@distroflow.com',
      passwordHash,
      role: 'warehouse_manager',
      phone: '+91 98203 98765',
      staffProfile: {
        create: {
          zone: 'West',
          salary: 38000,
          commissionPercent: 0,
          status: 'active',
        },
      },
    },
  });

  // 4. Staff: Accountant
  const accountant = await prisma.user.create({
    data: {
      name: 'Priya Verma',
      email: 'accounts.priya@distroflow.com',
      passwordHash,
      role: 'accountant',
      phone: '+91 98204 55667',
      staffProfile: {
        create: {
          zone: 'Central',
          salary: 55000,
          commissionPercent: 0,
          status: 'active',
        },
      },
    },
  });

  // 5. Staff: Delivery Person
  const deliveryStaff = await prisma.user.create({
    data: {
      name: 'Deepak Rao',
      email: 'delivery.deepak@distroflow.com',
      passwordHash,
      role: 'delivery_person',
      phone: '+91 98205 88990',
      staffProfile: {
        create: {
          zone: 'North',
          salary: 30000,
          commissionPercent: 0,
          status: 'active',
        },
      },
    },
  });

  // 6. Retailer User account
  const retailerUser = await prisma.user.create({
    data: {
      name: 'Rajesh Gupta',
      email: 'retail.apex@quickmart.in',
      passwordHash,
      role: 'retailer',
      phone: '+91 98206 11001',
    },
  });

  console.log('[Seed] Creating 15 Retailers across zones...');
  const retailersData = [
    {
      shopName: 'Apex Mart & Provisions',
      ownerName: 'Rajesh Gupta',
      email: 'retail.apex@quickmart.in',
      phone: '+91 98206 11001',
      gstNo: '27AABCA1234F1Z1',
      address: 'Shop 12, Galleria Arcade, Sector 4',
      city: 'Mumbai',
      zone: 'North',
      creditLimit: 250000,
      outstandingBalance: 68500,
      tag: 'Premium',
      assignedSalesExecId: sales1.id,
      userId: retailerUser.id,
    },
    {
      shopName: 'Metro Kirana Store',
      ownerName: 'Harish Patel',
      email: 'metro.kirana@gmail.com',
      phone: '+91 98206 11002',
      gstNo: '27BBCDE2345G2Z2',
      address: 'Plot 45, Station Road, Andheri West',
      city: 'Mumbai',
      zone: 'North',
      creditLimit: 200000,
      outstandingBalance: 125000,
      tag: 'Standard',
      assignedSalesExecId: sales1.id,
    },
    {
      shopName: 'Royal Provision Hub',
      ownerName: 'Mohd. Salim',
      email: 'royalprovision@outlook.com',
      phone: '+91 98206 11003',
      gstNo: '27CDEFE3456H3Z3',
      address: 'Shop 3, King Circle, Matunga',
      city: 'Mumbai',
      zone: 'Central',
      creditLimit: 150000,
      outstandingBalance: 32000,
      tag: 'Standard',
      assignedSalesExecId: sales1.id,
    },
    {
      shopName: 'Balaji Superstore',
      ownerName: 'Venkat Raman',
      email: 'balaji.super@yahoo.com',
      phone: '+91 98206 11004',
      gstNo: '29AAECS4567J4Z4',
      address: '88 Brigade Rd, MG Circle',
      city: 'Bengaluru',
      zone: 'South',
      creditLimit: 300000,
      outstandingBalance: 195000,
      tag: 'Premium',
      assignedSalesExecId: sales2.id,
    },
    {
      shopName: 'GreenGrocers & Mart',
      ownerName: 'Nandini Swamy',
      email: 'greengrocers.blr@gmail.com',
      phone: '+91 98206 11005',
      gstNo: '29BBDST5678K5Z5',
      address: '14 Indiranagar 100ft Rd',
      city: 'Bengaluru',
      zone: 'South',
      creditLimit: 180000,
      outstandingBalance: 45000,
      tag: 'Standard',
      assignedSalesExecId: sales2.id,
    },
    {
      shopName: 'Shiv Shakti Traders',
      ownerName: 'Ghanshyam Tiwari',
      email: 'shivshakti.retail@gmail.com',
      phone: '+91 98206 11006',
      gstNo: '27CCDSE6789L6Z6',
      address: '22 Bazaar Peth, Kalyan',
      city: 'Thane',
      zone: 'North',
      creditLimit: 120000,
      outstandingBalance: 114000,
      tag: 'High Risk',
      assignedSalesExecId: sales1.id,
    },
    {
      shopName: 'Golden Valley Mart',
      ownerName: 'Amit Saxena',
      email: 'goldenvalley@mart.in',
      phone: '+91 98206 11007',
      gstNo: '07AAECX7890M7Z7',
      address: 'G-14 Connaught Place',
      city: 'Delhi',
      zone: 'North',
      creditLimit: 350000,
      outstandingBalance: 82000,
      tag: 'Premium',
      assignedSalesExecId: sales1.id,
    },
    {
      shopName: 'Sunshine Daily Needs',
      ownerName: 'Karan Mehra',
      email: 'sunshine.daily@gmail.com',
      phone: '+91 98206 11008',
      gstNo: '07BBDCY8901N8Z8',
      address: 'Block C, Vasant Kunj',
      city: 'Delhi',
      zone: 'North',
      creditLimit: 150000,
      outstandingBalance: 28000,
      tag: 'Standard',
      assignedSalesExecId: sales1.id,
    },
    {
      shopName: 'Modern Mart',
      ownerName: 'Pooja Agarwal',
      email: 'modernmart.kol@gmail.com',
      phone: '+91 98206 11009',
      gstNo: '19AAECZ9012P9Z9',
      address: '77 Park Street, Park Circus',
      city: 'Kolkata',
      zone: 'East',
      creditLimit: 220000,
      outstandingBalance: 54000,
      tag: 'Standard',
    },
    {
      shopName: 'Howrah General Stores',
      ownerName: 'Bikram Das',
      email: 'howrah.stores@gmail.com',
      phone: '+91 98206 11010',
      gstNo: '19BBDCA0123Q1Z1',
      address: '102 GT Road, Howrah',
      city: 'Kolkata',
      zone: 'East',
      creditLimit: 100000,
      outstandingBalance: 98000,
      tag: 'High Risk',
    },
    {
      shopName: 'Siddhi Vinayak Retail',
      ownerName: 'Dilip Joshi',
      email: 'siddhivinayak.retail@gmail.com',
      phone: '+91 98206 11011',
      gstNo: '24AAECB1234R2Z2',
      address: '34 CG Road, Navrangpura',
      city: 'Ahmedabad',
      zone: 'West',
      creditLimit: 280000,
      outstandingBalance: 61000,
      tag: 'Premium',
    },
    {
      shopName: 'Gujarat Super Center',
      ownerName: 'Chirag Shah',
      email: 'gujarat.super@gmail.com',
      phone: '+91 98206 11012',
      gstNo: '24BBDCC2345S3Z3',
      address: '56 Ashram Road',
      city: 'Ahmedabad',
      zone: 'West',
      creditLimit: 175000,
      outstandingBalance: 42000,
      tag: 'Standard',
    },
    {
      shopName: 'City Pride HyperMart',
      ownerName: 'Sunil Rao',
      email: 'citypride@hypermart.in',
      phone: '+91 98206 11013',
      gstNo: '36AAECD3456T4Z4',
      address: 'Banjara Hills Rd No 2',
      city: 'Hyderabad',
      zone: 'South',
      creditLimit: 400000,
      outstandingBalance: 110000,
      tag: 'Premium',
      assignedSalesExecId: sales2.id,
    },
    {
      shopName: 'Deccan Groceries',
      ownerName: 'Farhan Siddiqui',
      email: 'deccan.groceries@gmail.com',
      phone: '+91 98206 11014',
      gstNo: '36BBDCE4567U5Z5',
      address: 'Charminar East Gate',
      city: 'Hyderabad',
      zone: 'South',
      creditLimit: 150000,
      outstandingBalance: 39000,
      tag: 'Standard',
      assignedSalesExecId: sales2.id,
    },
    {
      shopName: 'FreshBasket Corner',
      ownerName: 'Ananya Roy',
      email: 'freshbasket.new@gmail.com',
      phone: '+91 98206 11015',
      gstNo: '27CCDEF5678V6Z6',
      address: 'Lane 5, Koregaon Park',
      city: 'Pune',
      zone: 'West',
      creditLimit: 100000,
      outstandingBalance: 0,
      tag: 'New',
    },
  ];

  const createdRetailers = [];
  for (const r of retailersData) {
    const created = await prisma.retailer.create({ data: r });
    createdRetailers.push(created);
  }

  console.log('[Seed] Creating 30 Categorized Products with inventory levels & low-stock triggers...');
  const productsData = [
    // Beverages
    { sku: 'BEV-001', name: 'Tata Tea Gold Premium (1kg Pack)', category: 'Beverages', unit: 'Carton', price: 620, taxPercent: 5, stockQty: 85, reorderThreshold: 25, warehouseLocation: 'Rack A-01' },
    { sku: 'BEV-002', name: 'Nescafe Classic Instant Coffee Jar (200g)', category: 'Beverages', unit: 'Carton', price: 440, taxPercent: 18, stockQty: 40, reorderThreshold: 20, warehouseLocation: 'Rack A-02' },
    { sku: 'BEV-003', name: 'Bru Gold Roasted Coffee (100g Jar)', category: 'Beverages', unit: 'Carton', price: 290, taxPercent: 18, stockQty: 18, reorderThreshold: 25, warehouseLocation: 'Rack A-03' }, // Low stock
    { sku: 'BEV-004', name: 'Real Mixed Fruit Juice (1L Tetrapak x 12)', category: 'Beverages', unit: 'Case', price: 1440, taxPercent: 12, stockQty: 60, reorderThreshold: 20, warehouseLocation: 'Bay 1' },
    { sku: 'BEV-005', name: 'Red Bull Energy Drink (250ml Can x 24)', category: 'Beverages', unit: 'Case', price: 2850, taxPercent: 28, stockQty: 0, reorderThreshold: 15, warehouseLocation: 'Bay 1' }, // OUT OF STOCK (Backorder demonstration)
    { sku: 'BEV-006', name: 'Kinley Mineral Water 1L (Pack of 15)', category: 'Beverages', unit: 'Case', price: 240, taxPercent: 18, stockQty: 150, reorderThreshold: 40, warehouseLocation: 'Bay 2' },

    // Packaged Foods
    { sku: 'FOOD-101', name: 'Maggi 2-Minute Masala Noodles (Pack of 24)', category: 'Packaged Foods', unit: 'Carton', price: 336, taxPercent: 12, stockQty: 120, reorderThreshold: 30, warehouseLocation: 'Rack B-01' },
    { sku: 'FOOD-102', name: 'Aashirvaad Shudh Chakki Atta (10kg Bag)', category: 'Packaged Foods', unit: 'Bag', price: 435, taxPercent: 5, stockQty: 90, reorderThreshold: 25, warehouseLocation: 'Pallet C-01' },
    { sku: 'FOOD-103', name: 'Fortune Sunlite Refined Sunflower Oil (5L Jar)', category: 'Packaged Foods', unit: 'Case', price: 740, taxPercent: 5, stockQty: 15, reorderThreshold: 20, warehouseLocation: 'Pallet C-02' }, // Low stock
    { sku: 'FOOD-104', name: 'India Gate Classic Basmati Rice (5kg Bag)', category: 'Packaged Foods', unit: 'Bag', price: 680, taxPercent: 5, stockQty: 70, reorderThreshold: 20, warehouseLocation: 'Pallet C-03' },
    { sku: 'FOOD-105', name: 'Britannia Good Day Butter Cookies (Case of 48)', category: 'Packaged Foods', unit: 'Case', price: 960, taxPercent: 18, stockQty: 45, reorderThreshold: 15, warehouseLocation: 'Rack B-02' },
    { sku: 'FOOD-106', name: 'Parle-G Glucose Biscuits (Case of 72)', category: 'Packaged Foods', unit: 'Case', price: 720, taxPercent: 18, stockQty: 80, reorderThreshold: 25, warehouseLocation: 'Rack B-03' },
    { sku: 'FOOD-107', name: 'Kissan Fresh Tomato Ketchup (950g Bottle x 12)', category: 'Packaged Foods', unit: 'Case', price: 1560, taxPercent: 12, stockQty: 32, reorderThreshold: 15, warehouseLocation: 'Rack B-04' },
    { sku: 'FOOD-108', name: 'Kelloggs Corn Flakes Original (875g Box x 6)', category: 'Packaged Foods', unit: 'Case', price: 2100, taxPercent: 18, stockQty: 0, reorderThreshold: 10, warehouseLocation: 'Rack B-05' }, // OUT OF STOCK

    // Personal Care
    { sku: 'PERS-201', name: 'Dettol Original Germ Protection Soap (125g x 5)', category: 'Personal Care', unit: 'Carton', price: 280, taxPercent: 18, stockQty: 110, reorderThreshold: 30, warehouseLocation: 'Rack D-01' },
    { sku: 'PERS-202', name: 'Dove Cream Beauty Bar (100g x 4 Pack)', category: 'Personal Care', unit: 'Carton', price: 340, taxPercent: 18, stockQty: 65, reorderThreshold: 20, warehouseLocation: 'Rack D-02' },
    { sku: 'PERS-203', name: 'Colgate Strong Teeth Toothpaste (500g Value Pack)', category: 'Personal Care', unit: 'Carton', price: 245, taxPercent: 18, stockQty: 95, reorderThreshold: 25, warehouseLocation: 'Rack D-03' },
    { sku: 'PERS-204', name: 'Head & Shoulders Anti-Dandruff Shampoo (650ml)', category: 'Personal Care', unit: 'Carton', price: 580, taxPercent: 18, stockQty: 28, reorderThreshold: 15, warehouseLocation: 'Rack D-04' },
    { sku: 'PERS-205', name: 'Parachute 100% Pure Coconut Hair Oil (500ml Bottle)', category: 'Personal Care', unit: 'Carton', price: 210, taxPercent: 5, stockQty: 140, reorderThreshold: 30, warehouseLocation: 'Rack D-05' },
    { sku: 'PERS-206', name: 'Nivea Soft Light Moisturizer (300ml Tub)', category: 'Personal Care', unit: 'Carton', price: 395, taxPercent: 18, stockQty: 12, reorderThreshold: 20, warehouseLocation: 'Rack D-06' }, // Low stock
    { sku: 'PERS-207', name: 'Gillette Mach 3 Cartridge Blades (8 Pack)', category: 'Personal Care', unit: 'Box', price: 920, taxPercent: 18, stockQty: 50, reorderThreshold: 15, warehouseLocation: 'Lockup E-01' },

    // Household Goods
    { sku: 'HOUS-301', name: 'Surf Excel Quick Wash Detergent Powder (4kg Bag)', category: 'Household Goods', unit: 'Bag', price: 650, taxPercent: 18, stockQty: 75, reorderThreshold: 25, warehouseLocation: 'Pallet F-01' },
    { sku: 'HOUS-302', name: 'Ariel Matic Front Load Washing Powder (4kg)', category: 'Household Goods', unit: 'Bag', price: 890, taxPercent: 18, stockQty: 40, reorderThreshold: 20, warehouseLocation: 'Pallet F-02' },
    { sku: 'HOUS-303', name: 'Vim Dishwash Liquid Gel Lemon (2L Refill)', category: 'Household Goods', unit: 'Case', price: 420, taxPercent: 18, stockQty: 85, reorderThreshold: 20, warehouseLocation: 'Rack G-01' },
    { sku: 'HOUS-304', name: 'Lizol Disinfectant Surface Cleaner Citrus (2L)', category: 'Household Goods', unit: 'Case', price: 380, taxPercent: 18, stockQty: 60, reorderThreshold: 20, warehouseLocation: 'Rack G-02' },
    { sku: 'HOUS-305', name: 'Harpic Power Plus Toilet Cleaner 1L (Pack of 3)', category: 'Household Goods', unit: 'Case', price: 495, taxPercent: 18, stockQty: 55, reorderThreshold: 20, warehouseLocation: 'Rack G-03' },
    { sku: 'HOUS-306', name: 'GoodKnight Gold Flash Liquid Mosquito Refill (Pack of 4)', category: 'Household Goods', unit: 'Box', price: 310, taxPercent: 18, stockQty: 90, reorderThreshold: 25, warehouseLocation: 'Rack G-04' },
    { sku: 'HOUS-307', name: 'Colin Glass Cleaner Trigger Spray (500ml x 12)', category: 'Household Goods', unit: 'Case', price: 1140, taxPercent: 18, stockQty: 0, reorderThreshold: 15, warehouseLocation: 'Rack G-05' }, // OUT OF STOCK

    // Dairy & Cold
    { sku: 'DAIR-401', name: 'Amul Butter Salted (500g Block x 10)', category: 'Dairy & Cold', unit: 'Carton', price: 2750, taxPercent: 12, stockQty: 48, reorderThreshold: 15, warehouseLocation: 'Cold Room C-1' },
    { sku: 'DAIR-402', name: 'Amul Processed Cheese Slices (760g Pack x 6)', category: 'Dairy & Cold', unit: 'Carton', price: 2580, taxPercent: 12, stockQty: 35, reorderThreshold: 12, warehouseLocation: 'Cold Room C-2' },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  console.log('[Seed] Creating 50 Orders with mixed statuses across the pipeline...');
  const orderStatuses = ['Placed', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'];
  const paymentStatuses = ['Unpaid', 'Partial', 'Paid', 'Overdue'];

  const orders = [];
  const now = new Date();

  for (let i = 1; i <= 50; i++) {
    const retailer = createdRetailers[i % createdRetailers.length];
    const status = orderStatuses[i % orderStatuses.length];
    let paymentStatus = paymentStatuses[i % paymentStatuses.length];
    if (status === 'Delivered' && i % 3 === 0) paymentStatus = 'Paid';

    // Pick 2-4 random products
    const prodCount = 2 + (i % 3);
    const chosenProds = [];
    for (let j = 0; j < prodCount; j++) {
      const p = createdProducts[(i * 3 + j) % createdProducts.length];
      if (!chosenProds.find((cp) => cp.id === p.id)) {
        chosenProds.push(p);
      }
    }

    let subtotal = 0;
    let taxAmount = 0;
    let hasBackorder = false;

    // Simulate backorder condition for certain orders (e.g. orders using out-of-stock items)
    const itemsData = chosenProds.map((p) => {
      const qty = 3 + (i % 8);
      const isOos = p.stockQty === 0;
      let fulfilledQty = qty;
      let backorderedQty = 0;

      if (isOos || (i % 7 === 0)) {
        hasBackorder = true;
        fulfilledQty = Math.floor(qty / 2);
        backorderedQty = qty - fulfilledQty;
      }

      const itemTotal = qty * p.price;
      const itemTax = (itemTotal * p.taxPercent) / 100;
      subtotal += itemTotal;
      taxAmount += itemTax;

      return {
        productId: p.id,
        qty,
        fulfilledQty,
        backorderedQty,
        unitPrice: p.price,
        totalPrice: itemTotal,
      };
    });

    const totalAmount = Math.round(subtotal + taxAmount);
    let paidAmount = 0;
    if (paymentStatus === 'Paid') paidAmount = totalAmount;
    else if (paymentStatus === 'Partial') paidAmount = Math.round(totalAmount * 0.4);

    // Spread creation dates over past 90 days
    const daysAgo = Math.floor((50 - i) * 1.8);
    const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const orderId = `ORD-2026${String(Math.floor(i / 10) + 1).padStart(2, '0')}-${String(1000 + i)}`;

    const createdOrder = await prisma.order.create({
      data: {
        id: orderId,
        retailerId: retailer.id,
        status,
        paymentStatus,
        subtotal: Math.round(subtotal),
        taxAmount: Math.round(taxAmount),
        totalAmount,
        paidAmount,
        hasBackorder,
        deliveryZone: retailer.zone,
        placedByStaffId: (i % 4 === 0) ? sales1.id : (i % 4 === 1 ? sales2.id : null),
        packedByStaffId: ['Packed', 'Dispatched', 'Delivered'].includes(status) ? warehouseLead.id : null,
        deliveredByStaffId: ['Dispatched', 'Delivered'].includes(status) ? deliveryStaff.id : null,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: itemsData,
        },
      },
    });

    orders.push(createdOrder);

    // If order has paid amount, record matching Payment entry
    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          id: `PAY-2026-${String(2000 + i)}`,
          retailerId: retailer.id,
          orderId: createdOrder.id,
          amount: paidAmount,
          mode: (i % 2 === 0) ? 'UPI' : (i % 3 === 0 ? 'Bank Transfer' : 'Cash'),
          referenceNo: `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          status: 'Completed',
          collectedByStaffId: accountant.id,
        },
      });
    }
  }

  console.log('[Seed] Creating Audit Logs for key events...');
  const auditEntries = [
    { userName: 'Vikram Mehta', userRole: 'distributor', action: 'SYSTEM_INITIALIZED', entity: 'DistroFlow Workspace', details: 'Initialized distribution zones, GSTIN settings, and credit policies' },
    { userName: 'Vikram Mehta', userRole: 'distributor', action: 'STAFF_CREATED', entity: 'Staff: Rohit Sharma', details: 'Assigned Rohit Sharma as Sales Executive for North Zone' },
    { userName: 'Anil Kumar', userRole: 'warehouse_manager', action: 'STOCK_ADJUSTED', entity: 'Product: Tata Tea Gold', details: 'Replenished 50 cartons in Rack A-01 following inbound shipment' },
    { userName: 'Priya Verma', userRole: 'accountant', action: 'PAYMENT_RECORDED', entity: 'Retailer: Apex Mart', details: 'Recorded ₹45,000 payment via NEFT (UTR-9928172)' },
    { userName: 'Deepak Rao', userRole: 'delivery_person', action: 'ORDER_DELIVERED', entity: 'Order: ORD-202604-1035', details: 'Successfully delivered 4 cartons to Balaji Superstore' },
    { userName: 'Rohit Sharma', userRole: 'sales_exec', action: 'ORDER_PLACED', entity: 'Order: ORD-202605-1048', details: 'Field-visit order taken for Metro Kirana Store with backorder split' },
  ];

  for (const a of auditEntries) {
    await prisma.auditLog.create({
      data: {
        userName: a.userName,
        userRole: a.userRole,
        action: a.action,
        entity: a.entity,
        details: a.details,
      },
    });
  }

  console.log('[Seed] Creating initial role-specific notifications...');
  const notificationsData = [
    { targetRole: 'warehouse_manager', title: 'Critical Stock Alert', message: 'Red Bull 250ml & Colin Glass Cleaner are at 0 units. Backorders pending.', type: 'stock' },
    { targetRole: 'warehouse_manager', title: '5 Orders In Pack Queue', message: 'Morning batch ready for picking in Bayside 1 & 2.', type: 'order' },
    { targetRole: 'accountant', title: 'Aging Debt Alert', message: 'Shiv Shakti Traders & Howrah General have invoices > 60 days overdue.', type: 'payment' },
    { targetRole: 'delivery_person', title: 'Today\'s Route Dispatched', message: '4 drops scheduled in North Zone. First stop: Apex Mart.', type: 'order' },
    { targetRole: 'distributor', title: 'Monthly Revenue Milestones', message: 'DistroFlow crossed ₹28.5L gross order volume this quarter.', type: 'system' },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  console.log('[Seed] Finished successfully! Demo ready for evaluation.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
