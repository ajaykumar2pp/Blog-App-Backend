const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        blogs:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref: 'Blog'
            }
        ],
        date:{ type:String, default:Date.now },
        isAdmin:{
            type:Boolean,
            default:false
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
       
    },
    { timestamps: true });
module.exports = mongoose.model('Username', userSchema);