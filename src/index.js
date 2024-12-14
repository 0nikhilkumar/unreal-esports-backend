import { config } from "dotenv";
import connectDB from "./db/index.js";
// import app from "./app.js";
import httpServer from "./app.js";

config({ path: "./.env" });
const port = process.env.PORT || 3000;

connectDB();

httpServer.listen(port, () => {
  console.log(`Server is connected on PORT:${port}`);
});
