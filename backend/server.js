const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
console.log("DNS Servers:", dns.getServers());

require("dotenv").config();
const http = require("http");
const app = require("./index");
const { initSocket } = require("./analytics/socket/analyticsSocket");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server and Socket.IO running on port ${PORT}`);
});

module.exports = server;