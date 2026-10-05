"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const corsOriginsRaw = configService.get('CORS_ORIGINS') || '*';
    const corsOrigins = corsOriginsRaw === '*'
        ? '*'
        : corsOriginsRaw.split(',').map((origin) => origin.trim());
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });
    app.use((0, helmet_1.default)());
    app.setGlobalPrefix('api');
    const port = configService.get('PORT') || 3004;
    await app.listen(port);
    console.log(`🚀 Application running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map