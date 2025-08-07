"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Default tank data from Tank 1 to Tank 6
var defaultTanks = [
    {
        id: "T1",
        name: "Tank 1",
        capacity: 53000,
        product: "Crude Oil",
        location: "North Yard",
        lastInspection: new Date("2025-02-15"),
    },
    {
        id: "T2",
        name: "Tank 2",
        capacity: 25000,
        product: "Diesel",
        location: "North Yard",
        lastInspection: new Date("2025-02-20"),
    },
    {
        id: "T3",
        name: "Tank 3",
        capacity: 45000,
        product: "Gasoline",
        location: "East Yard",
        lastInspection: new Date("2025-03-01"),
    },
    {
        id: "T4",
        name: "Tank 4",
        capacity: 2000,
        product: "Jet Fuel",
        location: "East Yard",
        lastInspection: new Date("2025-03-05"),
    },
    {
        id: "T5",
        name: "Tank 5",
        capacity: 2000,
        product: "Kerosene",
        location: "South Yard",
        lastInspection: new Date("2025-02-25"),
    },
    {
        id: "T6",
        name: "Tank 6",
        capacity: 2000,
        product: "Lubricants",
        location: "South Yard",
        lastInspection: new Date("2025-03-10"),
    },
];
// Initial tank levels for the Tankage model
var initialTankage = {
    date: new Date(),
    T1: 65,
    T2: 60,
    T3: 85,
    T4: 55,
    T5: 70,
    T6: 45,
    notes: "Initial tank levels from migration script",
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var existingTanks_1, tanksToCreate, _i, tanksToCreate_1, tank, _a, defaultTanks_1, tank, existingTankage, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Starting tank migration and seeding...");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 18, 19, 21]);
                    return [4 /*yield*/, prisma.tank.findMany({
                            where: {
                                id: {
                                    in: defaultTanks.map(function (tank) { return tank.id; })
                                }
                            }
                        })];
                case 2:
                    existingTanks_1 = _b.sent();
                    if (!(existingTanks_1.length > 0)) return [3 /*break*/, 9];
                    console.log("Found ".concat(existingTanks_1.length, " existing tanks. Skipping tank creation for these tanks."));
                    tanksToCreate = defaultTanks.filter(function (tank) { return !existingTanks_1.some(function (existingTank) { return existingTank.id === tank.id; }); });
                    if (!(tanksToCreate.length > 0)) return [3 /*break*/, 7];
                    console.log("Creating ".concat(tanksToCreate.length, " new tanks..."));
                    _i = 0, tanksToCreate_1 = tanksToCreate;
                    _b.label = 3;
                case 3:
                    if (!(_i < tanksToCreate_1.length)) return [3 /*break*/, 6];
                    tank = tanksToCreate_1[_i];
                    return [4 /*yield*/, prisma.tank.create({
                            data: tank
                        })];
                case 4:
                    _b.sent();
                    console.log("Created tank: ".concat(tank.name, " (").concat(tank.id, ")"));
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.log("No new tanks to create.");
                    _b.label = 8;
                case 8: return [3 /*break*/, 13];
                case 9:
                    console.log("No existing tanks found. Creating all default tanks...");
                    _a = 0, defaultTanks_1 = defaultTanks;
                    _b.label = 10;
                case 10:
                    if (!(_a < defaultTanks_1.length)) return [3 /*break*/, 13];
                    tank = defaultTanks_1[_a];
                    return [4 /*yield*/, prisma.tank.create({
                            data: tank
                        })];
                case 11:
                    _b.sent();
                    console.log("Created tank: ".concat(tank.name, " (").concat(tank.id, ")"));
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13: return [4 /*yield*/, prisma.tankage.findFirst({
                        orderBy: {
                            date: 'desc'
                        }
                    })];
                case 14:
                    existingTankage = _b.sent();
                    if (!!existingTankage) return [3 /*break*/, 16];
                    console.log("No existing tankage records found. Creating initial tankage record...");
                    // Create initial tankage record
                    return [4 /*yield*/, prisma.tankage.create({
                            data: initialTankage
                        })];
                case 15:
                    // Create initial tankage record
                    _b.sent();
                    console.log("Created initial tankage record with default levels");
                    return [3 /*break*/, 17];
                case 16:
                    console.log("Existing tankage records found. Skipping initial tankage record creation.");
                    _b.label = 17;
                case 17:
                    console.log("Tank migration and seeding completed successfully!");
                    return [3 /*break*/, 21];
                case 18:
                    error_1 = _b.sent();
                    console.error("Error during tank migration and seeding:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 21];
                case 19: return [4 /*yield*/, prisma.$disconnect()];
                case 20:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
