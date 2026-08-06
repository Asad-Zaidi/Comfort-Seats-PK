const { Server } = require("socket.io");

let io = null;

exports.initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        socket.on("admin:subscribe", () => {
            socket.join("admin-analytics");
        });

        socket.on("disconnect", () => {
            // Disconnected client
        });
    });

    return io;
};

exports.getIO = () => {
    return io;
};
