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
var client_1 = require("../generated/prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@localhost:5432/caltrack',
});
var prisma = new client_1.PrismaClient({ adapter: adapter });
var sriLankanFoods = [
    { name: 'Chicken Kottu', serving: '1 portion (approx 400g)', kcal: 850, proteinG: 30, carbsG: 90, fatG: 40, isCustom: false },
    { name: 'String Hoppers (Indi Appam)', serving: '10 pieces', kcal: 250, proteinG: 4, carbsG: 55, fatG: 1, isCustom: false },
    { name: 'Hoppers (Appa)', serving: '1 plain hopper', kcal: 90, proteinG: 2, carbsG: 18, fatG: 1, isCustom: false },
    { name: 'Egg Hopper (Biththara Appa)', serving: '1 egg hopper', kcal: 160, proteinG: 8, carbsG: 18, fatG: 6, isCustom: false },
    { name: 'Pol Sambol', serving: '2 tablespoons', kcal: 100, proteinG: 1, carbsG: 4, fatG: 9, isCustom: false },
    { name: 'Dhal Curry (Parippu)', serving: '1 cup (approx 150g)', kcal: 180, proteinG: 9, carbsG: 25, fatG: 5, isCustom: false },
    { name: 'Red Rice (Cooked)', serving: '1 cup (approx 160g)', kcal: 200, proteinG: 4, carbsG: 43, fatG: 1, isCustom: false },
    { name: 'White Rice (Samba)', serving: '1 cup (approx 160g)', kcal: 205, proteinG: 4, carbsG: 45, fatG: 0, isCustom: false },
    { name: 'Fish Ambul Thiyal', serving: '1 piece (approx 50g)', kcal: 80, proteinG: 12, carbsG: 2, fatG: 2, isCustom: false },
    { name: 'Fish Rolls (Short Eats)', serving: '1 roll', kcal: 220, proteinG: 8, carbsG: 20, fatG: 12, isCustom: false },
    { name: 'Vegetable Roti', serving: '1 roti', kcal: 250, proteinG: 5, carbsG: 40, fatG: 8, isCustom: false },
    { name: 'Kiri Bath (Milk Rice)', serving: '1 piece (approx 100g)', kcal: 240, proteinG: 4, carbsG: 35, fatG: 9, isCustom: false },
    { name: 'Lunu Miris', serving: '1 tablespoon', kcal: 15, proteinG: 0, carbsG: 3, fatG: 0, isCustom: false },
    { name: 'Munchee Super Cream Cracker', serving: '1 biscuit (approx 8.5g)', kcal: 42, proteinG: 1, carbsG: 6, fatG: 1.5, isCustom: false },
    { name: 'Milo (RTD Pack)', serving: '200ml pack', kcal: 150, proteinG: 4.5, carbsG: 22, fatG: 4, isCustom: false },
    { name: 'Anchor Full Cream Milk Powder', serving: '2 tablespoons (approx 25g)', kcal: 130, proteinG: 6, carbsG: 10, fatG: 7, isCustom: false },
    { name: 'Samaposha', serving: '100g', kcal: 400, proteinG: 14, carbsG: 65, fatG: 8, isCustom: false },
    { name: 'Koththu Meesi (Chicken)', serving: '1 packet (approx 80g)', kcal: 360, proteinG: 8, carbsG: 50, fatG: 14, isCustom: false },
    { name: 'Chicken Curry (Sri Lankan)', serving: '1 portion (approx 100g)', kcal: 160, proteinG: 15, carbsG: 2, fatG: 10, isCustom: false },
    { name: 'Malu Paan (Fish Bun)', serving: '1 bun', kcal: 240, proteinG: 9, carbsG: 35, fatG: 7, isCustom: false },
    { name: 'Pittu', serving: '1 piece (approx 100g)', kcal: 210, proteinG: 3, carbsG: 45, fatG: 2, isCustom: false },
    { name: 'Gotukola Sambol', serving: '1/2 cup', kcal: 60, proteinG: 1, carbsG: 3, fatG: 5, isCustom: false },
    { name: 'Watalappam', serving: '1 piece (approx 100g)', kcal: 320, proteinG: 6, carbsG: 40, fatG: 16, isCustom: false },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Clearing existing system foods...');
                    return [4 /*yield*/, prisma.foodItem.deleteMany({
                            where: { isCustom: false }
                        })];
                case 1:
                    _a.sent();
                    console.log('Seeding Sri Lankan foods...');
                    return [4 /*yield*/, prisma.foodItem.createMany({
                            data: sriLankanFoods
                        })];
                case 2:
                    _a.sent();
                    console.log('Seeding completed successfully!');
                    return [2 /*return*/];
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
