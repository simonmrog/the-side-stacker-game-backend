import { IConfig } from "../interfaces/config.interface";

function configFactory(): IConfig {
  return {
    ENV: process.env.NODE_ENV ?? "dev",
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT!) : 4200,
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  };
}

export default configFactory();
