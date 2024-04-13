import {
    setupDatabase,
    getAllUsers,
    registerUser,
    getUserById,
    checkPassword,
    getUserByEmail,
    checkEmailExists,
    getUserByUsername,
    getSafeUserByUsername,
    resetPassword,
    generateResetToken,
    storeResetToken,
    getUserFromToken,
    getSafeAllUsers,
} from "./database";

import Bun from 'bun';
import { loginRoute } from "../routes/loginRoute";
import { resetPasswordRoute } from "../routes/resetPasswordRoute";

setupDatabase().then(() => console.log("Database setup complete")).catch((err) => { console.error(err); });

export const server = Bun.serve({
    async fetch(req: Request) {
        const url: URL = new URL(req.url);
        const path = url.pathname;

        if (path === "/") {
            const cookies = req.headers.get("Cookie");
            const items = cookies ? cookies.split('; ') : [];

            const localCookies: { [key: string]: string } = {};

            items.forEach((item) => {
                const [name, value] = item.split('=');
                localCookies[name] = value;
            });

            console.log("Cook1es:", localCookies);
            if (localCookies.userId) {
                const headers = new Headers();
                const user = await getUserById(localCookies.userId as unknown as number);
                if (user) {
                    headers.append('Location', '/users/' + user.username);
                } else {
                    headers.append('Location', '/');
                    headers.append('Set-Cookie', `userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                }
                return new Response(null, {
                    headers: headers,
                    status: 303
                });
            } else {
                return loginRoute(req);
            }
        }

        if (path === "/register") {
            if (req.method === "GET") {
                return new Response("Register page GET", { status: 200 });
            }

            if (req.method === "POST") {
                try {
                    const data = await req.text();
                    const params = new URLSearchParams(data);
                    const firstName = params.get("firstName");
                    const lastName = params.get("lastName");
                    const email = params.get("newEmail");
                    const password = params.get("newPassword");
                    const birthDate = params.get("birthday");
                    const gender = params.get("gender");

                    const emailExists = await checkEmailExists(email as string);

                    if (emailExists) {
                        return Response.redirect("/register", 303);
                    } else {
                        try {

                            if (!firstName || !lastName || !email || !password || !birthDate || gender === null) {
                                return new Response("Missing required fields", { status: 400 }); //! FIXME: This should redirect to the register page
                            }

                            await registerUser(
                                email,
                                password,
                                firstName,
                                lastName,
                                new Date(birthDate),
                                gender
                            );
                            const user = await getUserByEmail(email as string);
                            if (user) {
                                const headers = new Headers();
                                headers.append('Location', `/users/${user.username}`);
                                headers.append('Set-Cookie', `userId=${user.user_id}; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=3600;`);
                                return new Response(null, {
                                    headers: headers,
                                    status: 303
                                });
                            }
                        } catch (err) {
                            console.error('Error registering user: ', err);
                            return new Response((err as Error).message, { status: 500 });
                        }
                    }
                } catch (err) {
                    console.error('Error parsing form data: ', err);
                    return new Response("An error occurred", { status: 500 });
                }

                return new Response("Register page POST", { status: 200 });
            }
        }

        if (path === "/login") {
            if (req.method === "POST") {
                const data = await req.formData();
                const email = data.get("email");
                const password = data.get("password");

                if (!email || !password) {
                    return new Response("Missing email or password", { status: 400 });
                } 

                const user = await checkPassword(email.toString(), password.toString());

                if (user) {
                    const headers = new Headers();
                    const userData = await getUserByUsername(user.username);

                    const body = JSON.stringify(userData)
                    headers.append('Location', `/users/${user.username}`);
                    headers.append('Set-Cookie', `userId=${user.user_id}; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=3600;`);

                    return new Response(body, {
                        headers: headers,
                        status: 303
                    });
                } else {
                    return new Response("Invalid email or password", { status: 401 });
                }
            }
        }

        if (path === "/users") {
            if (req.method === "GET") {
                return Response.redirect("/users/", 303);
            }
        }

        if (path.startsWith("/users/")) {
            if (req.method === "GET") {
                const username = path.split("/")[2];

                if (!username) {
                    return Response.redirect("/", 303);
                }

                const cookies = req.headers.get("Cookie");
                const items= cookies ? cookies.split('; ') : [];

                const localCookies: { [key: string]: string } = {};

                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });
                console.log("Cookies:", localCookies);
                const requestedUser = await getUserByUsername(username);
                const otherUsers =  await getSafeAllUsers();
                
                let userData;
                
                if (requestedUser && Number(localCookies.userId) === requestedUser.user_id) {
                    userData = requestedUser;
                } else {
                    userData = await getSafeUserByUsername(username);
                }

                

                let users = [userData];
                otherUsers.forEach((user) => {
                    users.push(user);
                });
                let body = JSON.stringify(users);
                return new Response(body, { status: 200 });
            }
        }

        if (path === "/forgotPassword") {
            if (req.method === "POST") {
                const resetToken = generateResetToken();
                const data = await req.formData();
                const email = data.get("forgotEmail");
                const user = await getUserByEmail(email as string);
                if (user) {
                    await storeResetToken(user.email, resetToken);
                    const expiration = new Date();
                    return Response.redirect(`/resetPassword/?token=${resetToken}&email=${email}&expires=${expiration}`, 303);
                } else {
                    return new Response("/forgotPassword POST, user is null", { status: 404 });
                }
            }

            if (req.method === "GET") {
                return Response.redirect("/", 303);
            }
        }

        if (path.startsWith("/resetPassword")) {
            if (req.method === "GET") {
                const url = new URL(req.url);
                const email = url.searchParams.get('email');
                const user = await getUserByEmail(email as string);
                const token = user?.reset_token as string === url.searchParams.get('token') ? url.searchParams.get('token') : null;

                if (user && token) {
                    return resetPasswordRoute(req);
                } else {
                    return Response.redirect("/");
                }
            }

            if (req.method === "POST") {
                const formData = await req.formData();

                const token = formData.get("resetToken");
                const password = formData.get("newPassword");

                const user = await getUserFromToken(token as string);
                if (user && token && password) {
                    await resetPassword(user.email, token as string, password as string);
                } else {
                    return Response.redirect("/");
                }
            }
        }

        if (path === "/logout") {
            const headers = new Headers();
            headers.append('Location', '/');
            headers.append('Set-Cookie', `userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
            return new Response(null, {
                headers: headers,
                status: 303
            });
        }

        // 404s
        return Response.redirect("/", 404);
    },
    
});
console.log(`Listening on ${server.url}`);

