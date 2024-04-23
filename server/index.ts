import setupDatabase from "./database";
import { notFoundRoute } from "./routes/404";
import { checkEmailExistsPostRoute } from './routes/checkEmailExistsPost';
import { commentPostRoute } from './routes/commentPost';
import { forgotPasswordRoute } from "./routes/forgotPassword";
import { forgotPasswordPostRoute } from './routes/forgotPasswordPost';
import { homeRoute } from './routes/home';
import { loginRoute } from "./routes/login";
import { loginPostRoute } from './routes/loginPost';
import { logoutRoute } from './routes/logout';
import { postPostRoute } from './routes/postPost';
import { registrationRoute } from "./routes/register";
import { registerPostRoute } from './routes/registerPost';
import { resetPasswordRoute, resetPasswordRouteHandler } from "./routes/resetPassword";
import { resetPasswordPostRoute } from './routes/resetPasswordPost';
import { updateProfilePicturePostRoute } from './routes/updateProfilePicturePost';
import { usersRoute } from './routes/users';

require('dotenv').config();
setupDatabase().then(() => console.log("Database setup complete")).catch((err) => { console.error(err); });

export const server = Bun.serve({
    async fetch(req: Request) {
        const url: URL = new URL(req.url);
        const filePath = url.pathname;

        if (req.method === "GET") {
            if (filePath === "/") return homeRoute(req)
            if (filePath === "/login") return loginRoute(req)   
            if (filePath === "/logout") return logoutRoute(req)
            if (filePath === "/register") return registrationRoute(req)
            if (filePath === "/resetPassword") return resetPasswordRoute(req)
            if (filePath === "/users") return usersRoute(req)
            if (filePath.startsWith("/users/")) return usersRoute(req)
            if (filePath.startsWith("/forgotPassword")) return forgotPasswordRoute(req)
            if (filePath.startsWith("/resetPassword/")) return resetPasswordRouteHandler(req)
        }

        if (req.method === "POST") {
            if (filePath === "/login") return loginPostRoute(req)
            if (filePath === "/register") return registerPostRoute(req)
            if (filePath === "/resetPassword") return resetPasswordPostRoute(req)
            if (filePath === "/forgotPassword") return forgotPasswordPostRoute(req)
            if (filePath === "/checkEmailExists") return checkEmailExistsPostRoute(req)
            if (filePath === "/updateProfilePicture") return updateProfilePicturePostRoute(req)
            if (filePath === "/post") return postPostRoute(req)
            if (filePath === "/comment") return commentPostRoute(req)
        }        

        return notFoundRoute();
    },
});
console.log(`Listening on ${server.url}`);

