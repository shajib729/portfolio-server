require('dotenv').config()
require("./db/conn")
const express = require("express")
const app = express()
const port = process.env.PORT || 5000
const bodyParser=require("body-parser")
const cookieParser = require('cookie-parser')
const cors=require("cors")
const helmet=require("helmet")

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(helmet())

// Setup cors
const domainsFromEnv = process.env.CORS_DOMAINS || ""

const whitelist = domainsFromEnv.split(",").map(item => item.trim())

const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
}
  
app.use(cors(corsOptions))
  
// app.use(cors({
//     origin: ['http://localhost:3000'],
//     credentials: true,
// }))

app.use("/api/user", require('./routes/userRoute'))
app.use("/api/portfolio", require('./routes/portfolioRoute'))

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})