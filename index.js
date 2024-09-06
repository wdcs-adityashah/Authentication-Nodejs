const express = require('express');
const {connectToMongoDb} = require("./connect");
const path = require("path");
const cookieParser = require('cookie-parser');
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');
const URL = require('./models/url');
const app = express();
const PORT = 8001;
const {restrictToLoggedinUserOnly,checkAuth} =  require('./middleware/auth')
connectToMongoDb("mongodb://localhost:27017/short-url").then(()=>console.log('MongoDb Connected'));
app.use(cookieParser());
app.set("view engine","ejs");
app.set('views',path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use("/",checkAuth,staticRoute);
app.use("/url",restrictToLoggedinUserOnly,urlRoute);
app.use("/user",userRoute);
app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const timestamp = Date.now();
    console.log("Timestamp being added to visitHistory:", timestamp);

    const entry = await URL.findOneAndUpdate(
        { shortId },
        {
            $push: {
                visitHistory: {
                    timestamp
                }
            }
        },
        { new: true }
    );

    if (!entry) {
        return res.status(404).send("URL not found");
    }

    res.redirect(entry.redirectUrl);
});

app.listen(PORT,()=>console.log(`Server Started at PORT:${PORT}`));