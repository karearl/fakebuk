import { getSafeAllUsers, getUserByUsername } from "../services/user.service";
import { profileRoute } from "./profile";


export const usersRoute = async (req: Request) => {
    const url: URL = new URL(req.url);
    const path = url.pathname;

    const username = path.split("/")[2];
    if (!username) {
        return Response.redirect("/", 303);
    }

    const requestedUser = await getUserByUsername(username);
    if (!requestedUser) {
        return Response.redirect("/", 303);
    }

    const otherUsers =  await getSafeAllUsers();
    let users = [requestedUser];
    otherUsers.forEach((user) => {
        users.push(user);
    });

    return profileRoute(req);
}