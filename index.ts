import config from "./src/config/config";
import App from "./src/server";

const app = new App(config.PORT);
app.run();
