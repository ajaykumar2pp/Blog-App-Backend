const blogController = require("../app/controller/blogController");
const authMiddleware = require("../app/middleware/authMiddleware")

function initRoutes(app) {
    //********************************* Author Blog API routes  **************************** *//

  //  POST  http://localhost:8500/blog/add-blog
  app.post("/blog/add-blog", authMiddleware, blogController().create); // Add Blog

  //  GET  http://localhost:8500/blog/:_id  
  app.get("/blog/:id", authMiddleware, blogController().find); // Get Single Blog

  //  GET  http://localhost:8500/blog/all
  app.get("/blog", authMiddleware, blogController().index);  //Get All Blogs

  //  PUT  http://localhost:8500/blog/:_id
  app.put("/blog/:id", authMiddleware, blogController().update);  //Update Blog

  // DELETE   http://localhost:8500/blog/:_id
  app.delete("/blog/:id", authMiddleware, blogController().delete);  // Delete Blog

  // GET   http://localhost:8500/search/:key
  app.get("/search/:key", authMiddleware, blogController().search);  //Blog Search by Blog Name and Author Name

  // Blog Search by Author Id  API 
  app.get("/blog/author/:author_id", authMiddleware, blogController().findBooksByAuthorId);

  //  GET  http://localhost:8500/blog/all
  app.get("/categories",  blogController().getAllCategory);


}
module.exports = initRoutes