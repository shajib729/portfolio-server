const mongoose = require('mongoose')
const PortfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    img: {
        type: String,
        require: true,
    },
    link: {
        type: String,
        require: true,
    },
    github: {
        type: String,
        require: true,
    },
    tags: {
        type: Array,
    },
    serial: {
        type: Number,
    },
    publish: {
        type:Boolean
    }
},
{
    timestamps:true
})

const Portfolio = mongoose.model("Portfolio", PortfolioSchema)

module.exports = Portfolio;