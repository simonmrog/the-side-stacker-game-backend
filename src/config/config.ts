import { IConfig } from "./config.interface";

import "dotenv/config";

console.log(process.env.PORT);

function configFactory(): IConfig {
  return {
    ENV: process.env.NODE_ENV ?? "dev",
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT!) : 4200,
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
    GAME_COLOR_BAG: [
      {
        hue: 10,
        saturation: 100,
        lightness: 63.5,
      },
      {
        hue: 208,
        saturation: 75.2,
        lightness: 42.7,
      },
      {
        hue: 43,
        saturation: 100,
        lightness: 60.6,
      },
      {
        hue: 105,
        saturation: 49.8,
        lightness: 45.3,
      },
      {
        hue: 270,
        saturation: 50,
        lightness: 60,
      },
    ],
  };
}

export default configFactory();
