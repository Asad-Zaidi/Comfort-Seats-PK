const dns = require("dns");

// Force Node to use public DNS instead of localhost
dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("DNS Servers:", dns.getServers());


require("dotenv").config();
const app = require("./index");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
module.exports = app;