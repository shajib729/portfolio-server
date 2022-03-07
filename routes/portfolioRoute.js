const router = require("express").Router()
const multer = require("multer");
const userAuth = require("../middleware/userAuth")
const Portfolio = require("../model/PortfolioSchema")

//TODO: Used for multiform data FormData
const upload = multer({
    fileFilter:(req, file, cb)=>{uploadFilter(req, file, cb)}
})

router.post("/post", userAuth, upload.single('image'), async (req, res) => {
    let { title, image, link, github, publish, tags } = req.body;
    
    try {
        if (title && image && link && github) {
            if (image !== 'undefined') {
                let count = await Portfolio.count()
                await Portfolio.create({ title, img: image, link, github, serial: count+1, publish, tags:JSON.parse(tags)})

                res.status(200).json({message:"Created New Portfolio Successfully"})
            } else {
                res.status(400).json({error:"Image is not uploaded"})
            }
        } else {
            res.status(400).json({error:"Please fill all the field."})
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({error:err.message})
    }
})

router.get("/get", userAuth, async (req, res) => {
    try {
        let portfolio = await Portfolio.find().sort({ serial: -1 })
        res.status(200).json({portfolio})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.get("/get/:serial", userAuth, async (req, res) => {
    try {
        const {serial} = req.params

        let length = await Portfolio.count()
        let portfolio = await Portfolio.findOne({serial})
        res.status(200).json({portfolio, order:length+1-portfolio.serial})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.patch("/update/:serial", userAuth, upload.single('image'), async (req, res) => {
    const { serial } = req.params
    const { title, image, link, github, publish, tags } = req.body
    
    try {
        const portfolio_up=await Portfolio.find().sort({serial:1})
        await portfolio_up[serial-1].updateOne({ title, img: image, link, github, publish, tags:JSON.parse(tags)})
        // let portfolio = await Portfolio.find().sort({serial: -1})
        res.status(200).json({message:"Successfully Updated"})
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})


router.get("/update_order", userAuth, async (req, res) => {
    try {
        let { from, to } = req.query
        from=Number(from), to=Number(to)

        let portfolio = await Portfolio.find().sort({ serial: -1 })
        let length = await Portfolio.count()

        if (to>0 && to<=length && from>=to) {
            for (let i = to-1; i < from-1; i++){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial - 1 } })
            }
            await portfolio[from - 1].updateOne({ $set: { serial: length+1-to } })
            
        } else if(to>0 && to<=length && from<to) {
            for (let i = to-1; i > from-1; i--){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial + 1 } })
            }
            await portfolio[from-1].updateOne({ $set: { serial: length+1-to  } })
        } else {
            res.status(400).json({error:`Serial Number Must be 1 to ${length}`})
        }

        // let changed_order = await Portfolio.find().sort({ serial: -1 })

        res.status(200).json({message:"Successfully Order Changed"})

    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

router.delete("/delete/:serial", userAuth, async (req, res) => {
    try {
        let length = await Portfolio.count()
        
        const serial = length+1-req.params.serial
        let portfolio = await Portfolio.find().sort({ serial: -1 })
        // console.log({serial,portfolio});
        await portfolio[serial-1].deleteOne()

        if (serial > 1) {
            for (let i = serial-2; i >= 0; i--){
                await portfolio[i].updateOne({ $set: { serial: portfolio[i].serial - 1 } })
            }
        }

        res.status(200).json({message:"Successfully Deleted Portfolio"})
        
    } catch (err) {
        res.status(400).json({error:err.message})
    }
})

module.exports=router