"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const clothRoutes_1 = __importDefault(require("./routes/clothRoutes"));
require('dotenv').config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
(0, db_1.connectDB)();
app.get('/', (_req, res) => {
    res.send('Fashion Stylist API calisiyor!');
});
app.use('/api/cloths', clothRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde calisiyor.`);
});
//# sourceMappingURL=server.js.map