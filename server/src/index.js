import "dotenv/config";
import { createApp } from "./app.js";
import { DB_PATH } from "./db.js";

const PORT = Number(process.env.PORT || 4000);

createApp().listen(PORT, () => {
  console.log(`KineFix API escuchando en http://localhost:${PORT}`);
  console.log(`Base de datos: ${DB_PATH}`);
});
