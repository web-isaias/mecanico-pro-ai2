// Catálogo de veículos populares no Brasil
export type VehicleMake = {
  name: string;
  logo: string; // emoji/initial
  models: VehicleModel[];
};

export type VehicleModel = {
  name: string;
  years: string;
  engines: VehicleEngine[];
};

export type VehicleEngine = {
  name: string;
  fuel: string;
  power: string;
  oilType: string;
  oilCapacity: string;
  coolant: string;
  brakeFluid: string;
  tirePressure: string;
  sparkPlug: string;
  timingType: string;
};

export const VEHICLE_CATALOG: VehicleMake[] = [
  {
    name: "Chevrolet",
    logo: "C",
    models: [
      {
        name: "Onix 1.4",
        years: "2013-2019",
        engines: [
          {
            name: "1.4 8V SPE/4",
            fuel: "Flex",
            power: "98/106 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "3.5 L",
            coolant: "Líquido Rosa (OAT)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK BKR6E-11",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Onix Plus 1.0 Turbo",
        years: "2019+",
        engines: [
          {
            name: "1.0 Turbo 12V",
            fuel: "Flex",
            power: "116/125 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "4.0 L",
            coolant: "Líquido Rosa (OAT)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK ILZKR11B",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Celta 1.0",
        years: "2000-2015",
        engines: [
          {
            name: "1.0 8V VHC",
            fuel: "Flex",
            power: "60/66 cv",
            oilType: "5W30 Mineral/Sint.",
            oilCapacity: "3.2 L",
            coolant: "Líquido Verde (IAT)",
            brakeFluid: "DOT 3",
            tirePressure: "30/28 PSI",
            sparkPlug: "NGK BPR6EY",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Prisma 1.4",
        years: "2013-2019",
        engines: [
          {
            name: "1.4 8V SPE/4",
            fuel: "Flex",
            power: "98/106 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "3.5 L",
            coolant: "Líquido Rosa (OAT)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK BKR6E-11",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
  {
    name: "Volkswagen",
    logo: "V",
    models: [
      {
        name: "Gol 1.0",
        years: "2008-2018",
        engines: [
          {
            name: "1.0 8V VHT",
            fuel: "Flex",
            power: "72/76 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "3.0 L",
            coolant: "Líquido Rosa (G12+)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK BKR6E",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Gol 1.6",
        years: "2008-2018",
        engines: [
          {
            name: "1.6 8V VHT",
            fuel: "Flex",
            power: "101/104 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "3.5 L",
            coolant: "Líquido Rosa (G12+)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK BKR6E",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Fox 1.6",
        years: "2010-2018",
        engines: [
          {
            name: "1.6 8V VHT",
            fuel: "Flex",
            power: "104/110 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "3.5 L",
            coolant: "Líquido Rosa (G12+)",
            brakeFluid: "DOT 4",
            tirePressure: "33/30 PSI",
            sparkPlug: "NGK BKR6E",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
  {
    name: "Fiat",
    logo: "F",
    models: [
      {
        name: "Mobi 1.0",
        years: "2016+",
        engines: [
          {
            name: "1.0 8V Fire",
            fuel: "Flex",
            power: "70/75 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "2.6 L",
            coolant: "Líquido Rosa (Paraflu)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK PMR8B",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Uno 1.0",
        years: "2010-2014",
        engines: [
          {
            name: "1.0 8V Evo",
            fuel: "Flex",
            power: "73/75 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "2.6 L",
            coolant: "Líquido Rosa (Paraflu)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK PMR8B",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Strada 1.4",
        years: "2014+",
        engines: [
          {
            name: "1.4 8V Fire Evo",
            fuel: "Flex",
            power: "85/88 cv",
            oilType: "5W40 Sintético",
            oilCapacity: "3.2 L",
            coolant: "Líquido Rosa (Paraflu)",
            brakeFluid: "DOT 4",
            tirePressure: "38/36 PSI",
            sparkPlug: "NGK PMR8B",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
  {
    name: "Toyota",
    logo: "T",
    models: [
      {
        name: "Corolla 1.8",
        years: "2010-2019",
        engines: [
          {
            name: "1.8 16V VVT-i",
            fuel: "Flex",
            power: "136/144 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "4.2 L",
            coolant: "Líquido Rosa (LLC)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK IFR6A11",
            timingType: "Corrente de comando",
          },
        ],
      },
      {
        name: "Etios 1.5",
        years: "2014-2020",
        engines: [
          {
            name: "1.5 16V VVT-i",
            fuel: "Flex",
            power: "90/96 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "3.6 L",
            coolant: "Líquido Rosa (LLC)",
            brakeFluid: "DOT 4",
            tirePressure: "33/31 PSI",
            sparkPlug: "Denso FXE20HR11",
            timingType: "Corrente de comando",
          },
        ],
      },
    ],
  },
  {
    name: "Honda",
    logo: "H",
    models: [
      {
        name: "Civic 2.0",
        years: "2012-2016",
        engines: [
          {
            name: "2.0 16V i-VTEC",
            fuel: "Flex",
            power: "150/155 cv",
            oilType: "0W20 Sintético",
            oilCapacity: "4.3 L",
            coolant: "Líquido Azul (Type 2)",
            brakeFluid: "DOT 4",
            tirePressure: "32/30 PSI",
            sparkPlug: "NGK IZFR6K11",
            timingType: "Correia dentada",
          },
        ],
      },
      {
        name: "Fit 1.5",
        years: "2014-2019",
        engines: [
          {
            name: "1.5 16V i-VTEC",
            fuel: "Flex",
            power: "115/116 cv",
            oilType: "0W20 Sintético",
            oilCapacity: "3.6 L",
            coolant: "Líquido Azul (Type 2)",
            brakeFluid: "DOT 4",
            tirePressure: "33/31 PSI",
            sparkPlug: "NGK IZFR6K11",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
  {
    name: "Hyundai",
    logo: "H",
    models: [
      {
        name: "HB20 1.0",
        years: "2012-2019",
        engines: [
          {
            name: "1.0 12V Kappa",
            fuel: "Flex",
            power: "80/87 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "3.0 L",
            coolant: "Líquido Verde",
            brakeFluid: "DOT 4",
            tirePressure: "33/31 PSI",
            sparkPlug: "NGK SILZKR6B10E",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
  {
    name: "Ford",
    logo: "F",
    models: [
      {
        name: "Ka 1.0",
        years: "2014-2020",
        engines: [
          {
            name: "1.0 12V Ti-VCT",
            fuel: "Flex",
            power: "85/87 cv",
            oilType: "5W30 Sintético",
            oilCapacity: "3.5 L",
            coolant: "Líquido Laranja",
            brakeFluid: "DOT 4",
            tirePressure: "33/30 PSI",
            sparkPlug: "NGK ILZKR8B10",
            timingType: "Correia dentada",
          },
        ],
      },
    ],
  },
];

export function searchVehicles(query: string): {
  make: string;
  logo: string;
  model: string;
  years: string;
  engine: VehicleEngine;
}[] {
  const q = query.toLowerCase().trim();
  const results: {
    make: string;
    logo: string;
    model: string;
    years: string;
    engine: VehicleEngine;
  }[] = [];
  for (const make of VEHICLE_CATALOG) {
    for (const model of make.models) {
      for (const engine of model.engines) {
        const haystack = `${make.name} ${model.name} ${model.years} ${engine.name} ${engine.fuel}`.toLowerCase();
        if (!q || haystack.includes(q)) {
          results.push({
            make: make.name,
            logo: make.logo,
            model: model.name,
            years: model.years,
            engine,
          });
        }
      }
    }
  }
  return results.slice(0, 50);
}
