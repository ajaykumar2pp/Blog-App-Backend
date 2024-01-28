require('dotenv').config()
const mongoose = require('mongoose');
const multer = require("multer")
const path = require("path")
const fs = require('fs')
const Blog = require("../model/blogModel");
const User = require('../model/userModel')


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 3746674586-836534453.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 10 },
}).single('image'); // 10mb

function blogController() {
  return {

    // ****************************  Blog  Create ******************************//

    async create(req, resp) {
      try {
        handleMultipartData(req, resp, async (err) => {
          if (err) {
            console.error(err);
            return resp.status(500).json({ error: 'Internal server error' });
          }

          const { blogTitle, authorName, content,categories, author_id } = req.body;
          console.log(req.body)


          const filePath = req.file.path;

          if (!blogTitle || !authorName || !content || !categories || !author_id) {
            // If any required field is missing in the request, delete the uploaded image
            if (req.file) {
              try {
                fs.unlinkSync(req.file.path);
              } catch (unlinkError) {
                console.error(unlinkError);
              }
            }
            return resp.status(400).json({ error: 'All required fields are mandatory' });
          }

          // Check if the user with the specified author_id exists
          const user = await User.findById(author_id);
          if (!user) {
            // If the user is not found, delete the uploaded image
            if (req.file) {
              try {
                fs.unlinkSync(req.file.path);
              } catch (unlinkError) {
                console.error(unlinkError);
              }
            }
            return resp.status(404).json({ error: 'User not found' });
          }

          const imageURL = `http://${req.headers.host}/${filePath.replace(/\\/g, '/')}`;
          // console.log(req.file)
          // console.log(filePath)

          const createBlog = await Blog.create({
            blogTitle,
            authorName,
            content,
            author_id,
            categories,
            image: imageURL,
          });

          // Add the blog reference to the user
          user.blogs.push(createBlog);
          await user.save();


          console.log(createBlog)
          resp.status(201).json({ data: { blog: createBlog } })
        })
      } catch (err) {
        console.error(err);
        resp.status(500).json({ error: 'Failed to save blog' });
      }
    },

    // *****************  Find List All Blog *******************************//
    async index(req, resp) {
      try {
        let filter = {};
        const { category } = req.query;
    
        if (category && category !== 'All') {
          filter = { categories: category };
        }
    
        const blogs = await Blog.find(filter).select("-updatedAt -createdAt -__v").sort({ _id: -1 });
        //  console.log(blogs)
        if (blogs.length > 0) {
          resp.json({ data: { blog: blogs } });
        } else {
          resp.json({ data: { blog: "No Blog Found" } });
        }
      } catch (err) {
        console.error(err);
        resp.status(500).json({ error: "Failed to fetch blog" });
      }
    },

    //****************** Blog Update by Id  **************************** */
    async update(req, resp) {
      try {
        handleMultipartData(req, resp, async (err) => {
          if (err) {
            console.error(err);
            return resp.status(500).json({ error: 'Internal server error' });
          }

          const { blogTitle,content,categories, authorName} = req.body;
          console.log(req.body)



          let filePath;
          if (req.file) {
            // filePath = req.file.path
            filePath = req.file.path.replace(/\\/g, '/');
          }


          const imageURL = `http://${req.headers.host}/${filePath}`;

          console.log(filePath)

          const existingBlog = await Blog.findById(req.params.id);
          console.log("Exists Blog : ", existingBlog)

          if (!existingBlog) {
            return resp.status(404).json({ error: 'Blog not found' });
          }




          // If a new image is uploaded, delete the previous image
          if (req.file && existingBlog.image) {
            try {
              const imageUrl = existingBlog._doc.image;
              // Extract the path from the URL
              const imagePath = imageUrl.replace(`http://${req.headers.host}/`, '');

              await fs.promises.unlink(imagePath);
            } catch (err) {
              console.error(err);
              return resp.status(500).json({ error: "Failed to delete previous image" });
            }
          }


          let image;
          if (imageURL) {
            image = imageURL;
          } else {
            image = existingBlog.image;
          }

          const updateBlog = await Blog.findByIdAndUpdate(
            { _id: req.params.id },
            {
              blogTitle,
              authorName,
              content,
              categories,
              ...(req.file && { image: imageURL }),
            },
            { new: true }
          ).select("-updatedAt -createdAt -__v")
            .sort({ _id: -1 });

          if (!updateBlog) {
            return resp.status(404).json({ error: "Blog not found" });
          }

          console.log(updateBlog)
          resp.status(201).json({
            data: {
              book: updateBlog,
              message: "Blog Update sucessfully"
            }
          })
        })
      } catch (err) {
        console.error(err);
        resp.status(500).json({ error: 'Failed to update blog' });
      }
    },
    // ******************  Delete Blog by Id  ******************************//
    async delete(req, resp) {
      try {
        const blogId = req.params.id;
        const deleteBlog = await Blog.findOneAndRemove({ _id: blogId });
        if (!deleteBlog) {
          return resp.status(404).json({ error: "Blog not found" });
        }

        const imageUrl = deleteBlog._doc.image;
        // Extract the path from the URL 
        const imagePath = imageUrl.replace("http://localhost:8500/", '');
        console.log(imagePath)

        await fs.promises.unlink(imagePath);

        // Find the author and remove the blog reference
        const authorId = deleteBlog._doc.author_id;
        const author = await User.findById(authorId);

        if (author) {
          author.blogs.pull(blogId); // Remove the blogs reference
          await author.save();
        } else {
          console.error(`Author with id ${authorId} not found.`);
        }

        return resp.status(204).json({ data: { message: "Blog deleted successfully" } });

      } catch {
        console.error(error);
        resp.status(500).json({ error: "Failed to delete blog" });
      }
    },

    //*************  Find One Blog  ************* *//
    async find(req, resp) {
      try {
        const blogId = req.params.id;
        const findOneBlog = await Blog.findOne({ _id: blogId }).select(
          "-updatedAt -createdAt -_v"
        );
        if (!findOneBlog) {
          return resp.status(404).json({ error: "Blog not found" });
        }
        resp.json(findOneBlog);
      } catch (err) {
        resp.status(500).json({ error: "Failed to fetch blog" });
      }
    },

    //******************  Search Blog  *********************** */
    async search(req, resp) {
      try {
        let searchKey = req.params.key;
        let searchBlog = await Blog.find({
          "$or": [
            { blogTitle: { $regex: searchKey , $options: 'i'} },
            { authorName: { $regex: searchKey, $options: 'i' } },
          ],
        }).select("-updatedAt -createdAt -_v");
        if (searchBlog.length === 0) {
          return resp.status(404).json({ error: "Blog not found" });
        }
        resp.json(searchBlog);
      } catch (err) {
         console.error('Error searching for blogs:', err);
        resp.status(500).json({ error: "Failed to search blog" });
      }
    },

    //****************** All Blog Find By Author_id  *********************** *//
    async findBooksByAuthorId(req, resp) {
      try {
        const { author_id } = req.params;
        // console.log(author_id)

        // Valid author_id is a valid ObjectId 
        if (!mongoose.Types.ObjectId.isValid(author_id)) {
          return resp.status(400).json({ error: 'Invalid author_id' });
        }

        const blogs = await Blog.find({ author_id })
          .select("-updatedAt -createdAt -__v")
          .sort({ _id: -1 });

        if (blogs.length > 0) {
          return resp.json({ data: { blogs } });
        }

        return resp.json({ data: { message: "No blog found for the specified author_id" } });
      } catch (err) {
        console.error(err);
        return  resp.status(500).json({ error: "Failed to fetch blogs" });
      }
    },

     //****************** Get all categories  *********************** *//
     async getAllCategory(req, resp) {
      try {
        const blogs = await Blog.find();
        const allCategories = blogs.reduce(
          (categories, blog) => [...categories, ...blog.categories],
          []
        );
        const uniqueCategories = [...new Set(allCategories)];
        resp.json(uniqueCategories);
      } catch (error) {
        resp.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}
module.exports = blogController;
