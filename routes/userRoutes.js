const userController = require("../app/controller/userController");

function initRoutes(app) {
    //*********************************   User API routes  **************************** *//

    //  POST   http://localhost:8500/register   
    app.post("/register", userController().createUser); // User Register

    //  POST   http://localhost:8500/login
    app.post("/login", userController().loginUser); // User Login


}
module.exports = initRoutes