import express from "express";
import bodyParser from "body-parser";
import applyRoutes from "./helpers/appRoutes.js";
// import { api } from "./config.js";
import { connectDB } from "./Config/db.js";
import cors from "cors";


const app = express();
// const PORT = api.PORT || 8000;

app.use(bodyParser.json());

app.use(cors({
  origin: "*",
  exposedHeaders: ["Content-Disposition", "content-type"], // Add both casing versions
}));


// Health check route
app.get("/", (req, res) => {
  res.send("Hi, this is the server");
});



// OPTION 1: If network share is mapped to Z: drive
// For preview to work, expose the network path as a static route
// app.use("/File_Uplode", express.static("Z:\\192.168.23.15\File_Uplode"));


// OPTION 2: If using absolute path directly (e.g., mounted folder or local disk path)
// app.use("/File_Uplode", express.static("C:/File_Uplode"));

/** Apply other routes */
applyRoutes(app);

/** Start Server */
// app.listen(PORT, async () => {
//   await connectDB(); 
//   console.log(`The Port is Running on ${api.API_URL}`);
// });

app.listen(9000, async () => {
  await connectDB();
  console.log("The server is running on http://192.168.23.80:9000");
});

