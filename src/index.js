import { config } from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

config({ path: "./.env" });
const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server is connected on PORT:${port}`);
});
