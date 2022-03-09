const jwt = require("jsonwebtoken")
const User = require("../model/UserSchema")

const userAuth = async (req, res, next) => {
    try {
        const cookie=req.query.token
        const token =jwt.verify(cookie, process.env.SECRET_KEY)
        // console.log({token});
        if (!token) {
            res.status(401).json({error:"Denied to access! Please Login Again."})
        } else {
            const rootUser = await User.findOne({ _id: token._id })
            req.rootUser = rootUser
            req.userId=token._id
            req.token = req.query.token

            next()
        }
    } catch (err) {
        console.log({error:err.message});
        res.status(401).json({error:err.message})
    }
}

module.exports = userAuth