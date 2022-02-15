const express = require("express");
const mongoose = require("mongoose");
var cors = require('cors')
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const { errorHandler } = require("./error/errorHandler");
const api = require("./routes/api");
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api", api);
app.use("/", function (req, res) {
    res.json({ success: true, message: "Server is up and running" });
});

app.use(errorHandler);

app.use("*", (req, res) => {
    res.status(404).json({ success: false, message: "Resource not found" });
});

let PORT = process.env.PORT || 8000;

//connecting to database
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false 
}).then(() => {
    app.listen(PORT);
    console.log("server started");
}).catch((err) => {
    console.log(err);
});
