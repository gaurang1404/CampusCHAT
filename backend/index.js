import connectDB from "./src/config/db.js";
import app from "./src/app.js";
const PORT = process.env.PORT || 7001;

connectDB();

app.listen(PORT, () => console.log(`Server running: Port(http://localhost:${PORT})`));
