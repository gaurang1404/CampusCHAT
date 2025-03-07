import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import os from "os";

const PORT = process.env.PORT || 7001;

// Get Local Network IP Address
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === "IPv4" && !config.internal) {
                return config.address;
            }
        }
    }
    return "127.0.0.1"; // Fallback
};

const LOCAL_IP = getLocalIP();

connectDB();

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at:`);
    console.log(`   🔹 Local:   http://localhost:${PORT}`);
    console.log(`   🔹 Network: http://${LOCAL_IP}:${PORT}`);
});
