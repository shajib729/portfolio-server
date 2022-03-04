const router = require("express").Router()
const userAuth = require("../middleware/userAuth")
const Portfolio = require("../model/PortfolioSchema")

router.post("/post", async (req, res) => {
    let {title, img, link, github, publish}=req.body;

    try {
        if (title && img && link && github ) {
            let count = await Portfolio.count()
            let portfolio = await Portfolio.create({ title, img, link, github, serial: count+1, publish})
            
            res.status(200).json({message:"Created New Portfolio Successfully"})
        } else {
            res.status(400).json({error:"Please fill all the field."})
        }
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.get("/get", async (req, res) => {
    try {
        let portfolio = await Portfolio.find().sort({ serial: -1 })
        res.status(200).json({portfolio})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.patch("/update_order", async (req, res) => {
    try {
        let { from, to } = req.query

        let portfolio = await Portfolio.find().sort({ serial: -1 })
        let length = await Portfolio.count()

        if (from>to) {
            for (let i = to-1; i < from-1; i++){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial - 1 } })
            }
            await portfolio[from - 1].updateOne({ $set: { serial: length+1-to } })
            
        } else if(from<to) {
            for (let i = to-1; i > from-1; i--){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial + 1 } })
            }
            await portfolio[from-1].updateOne({ $set: { serial: length+1-to  } })
        }

        let changed_order = await Portfolio.find().sort({ serial: -1 })

        res.status(200).json({changed_order})

    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.patch("/update/:serial", async (req, res) => {
    const { serial } = req.params
    const {title, img, link, github, publish} = req.body
    try {
        const portfolio_up=await Portfolio.find().sort({serial:-1})
        await portfolio_up[serial-1].updateOne({ title, img, link, github, publish })
        let portfolio = await Portfolio.find().sort({serial: -1})
        res.status(200).json({portfolio})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.delete("/delete/:serial", async (req, res) => {
    try {
        const { serial } = req.params
        
        let portfolio = await Portfolio.find().sort({ serial: -1 })

        await portfolio[serial-1].deleteOne()

        if (serial > 1) {
            for (let i = serial-2; i >= 0; i--){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial - 1 } })
            }
        }
        
        let portfolio2 = await Portfolio.find().sort({ serial: -1 })

        res.status(200).json({portfolio2})
        
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

module.exports=router