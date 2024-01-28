require('dotenv').config()
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema(
    {
        blogTitle: { type: String, required: true },
        authorName: { type: String, required: true },
        author_id: {
            type: mongoose.Schema.Types.ObjectId,
             ref: 'Username'
        },
        content: { type: String, required: true },
        image: {
            type: String, required: true,
            get: function (image) {
                if (process.env.ON_RENDER === 'true') {
                    return image;
                }
                return `${image}`
            }
        },
        categories: [{ type: String, required:true }]

    },
    { timestamps: true, toJSON: { getters: true }, id: false }
);
module.exports = mongoose.model('Blog', blogSchema);