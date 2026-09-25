// Seed script - run with: bun run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.obdScan.deleteMany();
  await prisma.defect.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ===== Demo user (workshop owner account) =====
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@mecanicopro.ai",
      name: "Mecânico Master",
      workshopName: "Oficina Premium",
      passwordHash,
      role: "owner",
      subscriptionStatus: "active",
      plan: "annual",
      subscriptionId: "demo_active_sub",
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`   ✓ Demo user: demo@mecanicopro.ai / demo1234`);

  // ===== Customers + Vehicles =====
  const c1 = await prisma.customer.create({
    data: {
      userId: demoUser.id,
      name: "João Silva",
      phone: "(11) 98765-4321",
      whatsapp: "5511987654321",
      email: "joao.silva@email.com",
      document: "123.456.789-00",
      address: "Rua das Flores, 123 - São Paulo/SP",
      notes: "Cliente fiel, sempre faz manutenção em dia",
      vehicles: {
        create: [
          {
            brand: "Honda",
            model: "Civic 2.0",
            year: 2015,
            fuel: "Flex",
            engine: "2.0 16V i-VTEC",
            plate: "ABC1D23",
            mileage: 87500,
            nextService: new Date(Date.now() + 86400000),
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  const c2 = await prisma.customer.create({
    data: {
      userId: demoUser.id,
      name: "Maria Oliveira",
      phone: "(11) 91234-5678",
      whatsapp: "5511912345678",
      email: "maria.oliveira@email.com",
      document: "987.654.321-00",
      address: "Av. Paulista, 1000 - São Paulo/SP",
      vehicles: {
        create: [
          {
            brand: "Chevrolet",
            model: "Onix 1.4",
            year: 2017,
            fuel: "Flex",
            engine: "1.4 8V SPE/4",
            plate: "DEF4G56",
            mileage: 64200,
            nextService: new Date(Date.now() + 3 * 86400000),
          },
          {
            brand: "Fiat",
            model: "Mobi 1.0",
            year: 2019,
            fuel: "Flex",
            engine: "1.0 8V Fire",
            plate: "GHI7H89",
            mileage: 23100,
          },
        ],
      },
    },
  });

  const c3 = await prisma.customer.create({
    data: {
      userId: demoUser.id,
      name: "Carlos Ferreira",
      phone: "(21) 99999-1111",
      whatsapp: "5521999991111",
      email: "carlos.ferreira@email.com",
      document: "111.222.333-44",
      address: "Rua do Comércio, 45 - Rio de Janeiro/RJ",
      vehicles: {
        create: [
          {
            brand: "Volkswagen",
            model: "Gol 1.6",
            year: 2015,
            fuel: "Flex",
            engine: "1.6 8V VHT",
            plate: "JKL0M12",
            mileage: 102000,
          },
        ],
      },
    },
  });

  const c4 = await prisma.customer.create({
    data: {
      userId: demoUser.id,
      name: "Ana Souza",
      phone: "(47) 98888-2222",
      whatsapp: "5547988882222",
      email: "ana.souza@email.com",
      document: "555.666.777-88",
      address: "Rua das Acácias, 88 - Curitiba/PR",
      vehicles: {
        create: [
          {
            brand: "Toyota",
            model: "Corolla 1.8",
            year: 2018,
            fuel: "Flex",
            engine: "1.8 16V VVT-i",
            plate: "MNO3P45",
            mileage: 45800,
          },
        ],
      },
    },
  });

  // ===== Appointments =====
  const today = new Date();
  const todayAt = (h: number, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };
  await prisma.appointment.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "Troca de óleo + filtros",
        customerId: c1.id,
        vehicleDesc: "Honda Civic 2.0 - ABC1D23",
        type: "maintenance",
        status: "confirmed",
        startDate: todayAt(9, 0),
        endDate: todayAt(10, 0),
        notes: "Óleo 0W20, filtro de óleo e ar",
      },
      {
        userId: demoUser.id,
        title: "Diagnóstico luz da injeção",
        customerId: c2.id,
        vehicleDesc: "Chevrolet Onix 1.4 - DEF4G56",
        type: "service",
        status: "scheduled",
        startDate: todayAt(11, 0),
        endDate: todayAt(12, 30),
        notes: "Cliente relata código P0171",
      },
      {
        userId: demoUser.id,
        title: "Revisão 60mil km",
        customerId: c3.id,
        vehicleDesc: "VW Gol 1.6 - JKL0M12",
        type: "review",
        status: "scheduled",
        startDate: todayAt(14, 0),
        endDate: todayAt(17, 0),
      },
      {
        userId: demoUser.id,
        title: "Troca de pastilhas de freio",
        customerId: c4.id,
        vehicleDesc: "Toyota Corolla 1.8 - MNO3P45",
        type: "service",
        status: "scheduled",
        startDate: todayAt(16, 0),
        endDate: todayAt(17, 30),
      },
      {
        userId: demoUser.id,
        title: "Alinhamento e balanceamento",
        type: "service",
        status: "scheduled",
        startDate: todayAt(17, 0),
        endDate: todayAt(18, 0),
      },
    ],
  });

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  await prisma.appointment.create({
    data: {
      userId: demoUser.id,
      title: "Revisão completa",
      customerId: c2.id,
      vehicleDesc: "Fiat Mobi 1.0 - GHI7H89",
      type: "review",
      status: "scheduled",
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 3 * 3600000),
    },
  });

  // ===== Service Orders (history) =====
  const v1 = c1.vehicles[0];
  await prisma.serviceOrder.createMany({
    data: [
      {
        userId: demoUser.id,
        customerId: c1.id,
        vehicleId: v1?.id,
        title: "Troca de óleo e filtros",
        description: "Troca de óleo 0W20 sintético, filtro de óleo e ar. Verificação geral.",
        status: "done",
        priority: "normal",
        laborCost: 120,
        partsCost: 380,
        totalCost: 500,
        warranty: "90 dias",
        completedAt: new Date(Date.now() - 7 * 86400000),
        scheduledAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        userId: demoUser.id,
        customerId: c2.id,
        title: "Diagnóstico eletrônico",
        description: "Scanner OBD2, verificação de sensores",
        status: "done",
        priority: "normal",
        laborCost: 80,
        partsCost: 0,
        totalCost: 80,
        completedAt: new Date(Date.now() - 14 * 86400000),
        scheduledAt: new Date(Date.now() - 14 * 86400000),
      },
      {
        userId: demoUser.id,
        customerId: c3.id,
        title: "Troca de pastilhas e discos",
        description: "Pastilhas dianteiras, discs ventilados",
        status: "in_progress",
        priority: "high",
        laborCost: 280,
        partsCost: 520,
        totalCost: 800,
        scheduledAt: new Date(),
      },
      {
        userId: demoUser.id,
        customerId: c4.id,
        title: "Revisão 45mil km",
        description: "Revisão completa conforme manual",
        status: "done",
        priority: "normal",
        laborCost: 200,
        partsCost: 450,
        totalCost: 650,
        completedAt: new Date(Date.now() - 3 * 86400000),
        scheduledAt: new Date(Date.now() - 3 * 86400000),
      },
    ],
  });

  // ===== Inventory =====
  await prisma.inventoryItem.createMany({
    data: [
      { userId: demoUser.id, name: "Filtro de óleo Onix 1.4", sku: "FO-ONX-14", barcode: "7891234", category: "parts", supplier: "AutoPeças SP", quantity: 12, minStock: 5, purchasePrice: 18, salePrice: 35, unit: "un", location: "Prateleira A1" },
      { userId: demoUser.id, name: "Filtro de óleo Gol 1.0", sku: "FO-GOL-10", barcode: "7895678", category: "parts", supplier: "AutoPeças SP", quantity: 3, minStock: 8, purchasePrice: 15, salePrice: 30, unit: "un", location: "Prateleira A2" },
      { userId: demoUser.id, name: "Óleo 5W30 Sintético 1L", sku: "OL-5W30-1L", barcode: "7899012", category: "fluids", supplier: "Lubrificantes BR", quantity: 45, minStock: 20, purchasePrice: 28, salePrice: 45, unit: "L", location: "Estante B1" },
      { userId: demoUser.id, name: "Vela NGK BKR6E-11", sku: "VL-NGK-BKR6E11", barcode: "7893456", category: "parts", supplier: "NGK Brasil", quantity: 24, minStock: 12, purchasePrice: 12, salePrice: 25, unit: "un", location: "Prateleira C3" },
      { userId: demoUser.id, name: "Pastilha de freio Civic 2.0", sku: "PF-CIV-20", barcode: "7897890", category: "parts", supplier: "Freios Premium", quantity: 2, minStock: 4, purchasePrice: 85, salePrice: 160, unit: "jogo", location: "Prateleira D1" },
      { userId: demoUser.id, name: "Fluido de freio DOT 4 1L", sku: "FF-DOT4-1L", barcode: "7892345", category: "fluids", supplier: "Lubrificantes BR", quantity: 18, minStock: 6, purchasePrice: 22, salePrice: 38, unit: "L", location: "Estante B2" },
      { userId: demoUser.id, name: "Líquido de arrefecimento 5L", sku: "LA-ROSA-5L", barcode: "7896789", category: "fluids", supplier: "Lubrificantes BR", quantity: 9, minStock: 5, purchasePrice: 38, salePrice: 65, unit: "gal", location: "Estante B3" },
      { userId: demoUser.id, name: "Chave torx T50", sku: "FR-TX-T50", category: "tools", quantity: 5, minStock: 2, purchasePrice: 18, salePrice: 0, unit: "un", location: "Caixa de ferramentas" },
    ],
  });

  // ===== Suppliers =====
  await prisma.supplier.createMany({
    data: [
      { userId: demoUser.id, name: "AutoPeças SP", phone: "(11) 3333-4444", email: "vendas@autopecassp.com.br", cnpj: "11.222.333/0001-44", address: "Av. Industrial, 500 - São Paulo/SP" },
      { userId: demoUser.id, name: "Lubrificantes BR", phone: "(11) 4444-5555", email: "contato@lubbr.com.br", cnpj: "22.333.444/0001-55" },
      { userId: demoUser.id, name: "NGK Brasil", phone: "(11) 5555-6666", email: "comercial@ngk.com.br", cnpj: "33.444.555/0001-66" },
    ],
  });

  // ===== Transactions =====
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(9 + (i % 8), 0, 0, 0);
    const isIncome = i % 3 !== 0; // 2 incomes to 1 expense
    const categories = ["service", "parts", "labor", "rent", "utility"];
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: isIncome ? "income" : "expense",
        category: isIncome ? (i % 2 === 0 ? "service" : "parts") : categories[3 + (i % 2)],
        description: isIncome
          ? `Ordem de serviço #${1000 + i}`
          : ["Aluguel da oficina", "Conta de energia", "Conta de água"][i % 3],
        amount: isIncome ? 250 + Math.floor(Math.random() * 600) : 120 + Math.floor(Math.random() * 300),
        date: d,
        status: "paid",
      },
    });
  }
  // Today transactions
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: "income",
      category: "service",
      description: "Troca de óleo - Honda Civic",
      amount: 500,
      date: todayAt(9, 30),
      status: "paid",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: "income",
      category: "parts",
      description: "Venda de pastilhas avulso",
      amount: 160,
      date: todayAt(11, 15),
      status: "paid",
    },
  });
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: "expense",
      category: "parts",
      description: "Compra de filtros - AutoPeças SP",
      amount: 380,
      date: todayAt(8, 0),
      status: "paid",
    },
  });

  // ===== Defects =====
  await prisma.defect.createMany({
    data: [
      {
        userId: demoUser.id,
        author: "Marcos Oficina",
        vehicleDesc: "Chevrolet Onix 1.4 2017",
        symptom: "Luz da injeção acesa, motor falhando em marcha lenta",
        diagnosis: "Código P0171 - mistura pobre. Vácuo na junta do coletor de admissão.",
        solution: "Substituída junta do coletor de admissão. Limpeza do sensor MAF. Problema resolvido.",
        repairTime: "3h",
        difficulty: "medium",
        likes: 24,
      },
      {
        userId: demoUser.id,
        author: "AutoMec Team",
        vehicleDesc: "Volkswagen Gol 1.0 2014",
        symptom: "Carro não pega de manhã, só empurrando",
        diagnosis: "Bomba de combustível com pressão baixa (2.1 bar ao invés de 4 bar).",
        solution: "Substituída bomba de combustível no tanque. Recuperou a pressão correta.",
        repairTime: "2h",
        difficulty: "medium",
        likes: 18,
      },
      {
        userId: demoUser.id,
        author: "Eletricista Paulo",
        vehicleDesc: "Fiat Mobi 1.0 2019",
        symptom: "Bateria descarregando do dia para a noite",
        diagnosis: "Consumo parassita de 1.2A. Alternador com diodo em curto.",
        solution: "Recondicionado alternador (trocado ponte retificadora). Consumo parassita < 50mA.",
        repairTime: "4h",
        difficulty: "hard",
        likes: 31,
      },
      {
        userId: demoUser.id,
        author: "Oficina do Zé",
        vehicleDesc: "Toyota Corolla 1.8 2018",
        symptom: "Ruído metálico ao virar o volante",
        diagnosis: "Rolagem da coluna de direção desgastada.",
        solution: "Substituída coluna de direção usada com garantia. Sem mais ruído.",
        repairTime: "5h",
        difficulty: "hard",
        likes: 12,
      },
    ],
  });

  // ===== Quotes =====
  await prisma.quote.create({
    data: {
      userId: demoUser.id,
      number: "ORC-2024-001",
      customerId: c1.id,
      vehicleId: v1?.id,
      items: JSON.stringify([
        { description: "Troca de óleo 0W20 + filtro", type: "service", quantity: 1, unitPrice: 120, total: 120 },
        { description: "Filtro de óleo Honda Civic", type: "part", quantity: 1, unitPrice: 85, total: 85 },
        { description: "Óleo 0W20 sintético 5L", type: "part", quantity: 1, unitPrice: 225, total: 225 },
      ]),
      laborTotal: 120,
      partsTotal: 310,
      taxPercent: 0,
      discount: 0,
      total: 430,
      status: "sent",
      notes: "Garantia de 90 dias no serviço",
    },
  });

  // ===== Notifications =====
  await prisma.notification.createMany({
    data: [
      { type: "review", title: "Revisão pendente", message: "Honda Civic 2.0 atingiu km para revisão" },
      { type: "oil", title: "Troca de óleo", message: "Chevrolet Onix 1.4 venceu prazo de troca" },
      { type: "stock", title: "Estoque baixo", message: "Filtro de óleo Gol 1.0 abaixo do mínimo" },
      { type: "warranty", title: "Garantia vencendo", message: "Serviço #1003 vence em 7 dias" },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - Customers: 4`);
  console.log(`   - Vehicles: 5`);
  console.log(`   - Appointments: 6`);
  console.log(`   - Service Orders: 4`);
  console.log(`   - Inventory items: 8`);
  console.log(`   - Suppliers: 3`);
  console.log(`   - Transactions: ~17`);
  console.log(`   - Defects: 4`);
  console.log(`   - Quotes: 1`);
  console.log(`   - Notifications: 4`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
