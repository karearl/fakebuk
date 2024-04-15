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
    sendResetTokenEmail,
    isTokenExpired,
} from "./database";

import { loginRoute } from "../routes/loginRoute";
import { resetPasswordRoute } from "../routes/resetPasswordRoute";
import { forgotPasswordRoute } from "../routes/forgotPasswordRoute";
import { registrationRoute } from "../routes/registrationRoute";
import { ExplainVerbosity } from "typeorm";

setupDatabase().then(() => console.log("Database setup complete")).catch((err) => { console.error(err); });

export const server = Bun.serve({
    async fetch(req: Request) {
        const url: URL = new URL(req.url);
        const path = url.pathname;

        if (req.method === "GET") {
            if (path === "/") {
                const cookies = req.headers.get("Cookie");
                const items = cookies ? cookies.split('; ') : [];
                const localCookies: { [key: string]: string } = {};
                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });
                if (localCookies.userId === undefined) return loginRoute(req);

                const headers = new Headers();
                const user = await getUserById(localCookies.userId as unknown as number);
                
                if (user === null) {
                    headers.append('Location', '/login/');
                    headers.append('Set-Cookie', `userId=; Path=/login/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                } else {
                    headers.append('Location', '/users/' + user.username);
                }
                return new Response(null, { headers: headers, status: 303 });
            }
            if (path === "/logout") {
                const headers = new Headers();
                headers.append('Location', '/');
                headers.append('Set-Cookie', `userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
                return new Response(null, {headers: headers, status: 303});
            }
            if (path === "/login") return loginRoute(req)
            if (path === "/register") return registrationRoute(req)
            if (path === "/resetPassword") return resetPasswordRoute(req)
            if (path.startsWith("/forgotPassword")) return forgotPasswordRoute(req)
            if (path === "/users") {return Response.redirect("/users/", 303);}

            if (path.startsWith("/resetPassword/")) {
                const url = new URL(req.url);
                const email = url.searchParams.get('email');
                const token = url.searchParams.get('token');

                if (!email && !token) {
                    return forgotPasswordRoute(req);
                }
                const user = await getUserByEmail(email as string);
                if (user && user.reset_token === token) {
                    return resetPasswordRoute(req);
                }
                return Response.redirect("/");
            }

            if (path.startsWith("/users/")) {
                const username = path.split("/")[2];
                if (!username) {
                    return Response.redirect("/", 303);
                }
                const cookies = req.headers.get("Cookie");
                const items = cookies ? cookies.split('; ') : [];
                const localCookies: { [key: string]: string } = {};
                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });

                console.log("Cookies:", localCookies);
                const requestedUser = await getUserByUsername(username);
                const otherUsers =  await getSafeAllUsers();
                let userData;
                userData = requestedUser;
                if (requestedUser && Number(localCookies.userId) !== requestedUser.user_id) {
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

        if (req.method === "POST") {
            if (path === "/checkEmailExists") {
                const data = await req.json();
                const email = data.email;
                const emailExists = await checkEmailExists(email);
                return new Response(JSON.stringify({ emailExists: !!emailExists }), { status: 200 });
            }

            if (path === "/forgotPassword") {
                const data = await req.json();
                const email = data.email;
                const user = await getUserByEmail(email);

                if (!user) {
                    return new Response("/forgotPassword POST, user is null", { status: 404 });
                }

                let resetToken = user.reset_token;
                let expiration;

                if (!resetToken || (user.reset_token_expiration && await isTokenExpired(user.reset_token_expiration))) {
                    resetToken = generateResetToken();
                    await storeResetToken(user.email, resetToken);
                    expiration = new Date();
                    expiration.setHours(expiration.getHours() + 1);
                } else {
                    expiration = new Date(user.reset_token_expiration as unknown as Date);
                }

                await sendResetTokenEmail(user.email, resetToken, expiration);
                return new Response(JSON.stringify({ email: email, resetToken: resetToken, expiration: expiration }), { status: 200 });
            }
        }


        if (path === "/register") {

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

                    if (!firstName || !lastName || !email || !password || !birthDate || gender === null) {
                        return registrationRoute(req);
                    }

                    // Check if email already exists
                    const emailExists = await checkEmailExists(email as string);
                    if (emailExists) {
                        return Response.redirect("/register", 303);
                    }

                    // Register user
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

                return new Response("Register page POST", { status: 200 });
            }
        }

        if (path === "/login") {


            if (req.method === "POST") {
                const data = await req.formData();
                const email = data.get("email");
                const password = data.get("password");

                if (!email || !password) { //! FIXME: This should redirect to the login page
                    return loginRoute(req);
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

        if (path === "/forgotPassword") {
            if (req.method === "POST") {
                const data = await req.formData();
                const email = data.get("forgotEmail");
                const user = await getUserByEmail(email as string);
                if (!user) {
                    return new Response("/forgotPassword POST, user is null", { status: 404 });
                }
                const resetToken = generateResetToken();
                await storeResetToken(user.email, resetToken);
                    const expiration = new Date();
                    return Response.redirect(`/resetPassword/?token=${resetToken}&email=${email}&expires=${expiration}`, 303);
            }
        }

        if (path.startsWith("/resetPassword")) {
            if (req.method === "POST") {
                const formData = await req.formData();

                const token = formData.get("resetToken");
                const password = formData.get("newPassword");

                const user = await getUserFromToken(token as string);
                if (user && token && password) {
                    await resetPassword(user.email, token as string, password as string);
                    return Response.redirect("/login", 303);
                } else {
                    return Response.redirect("/");
                }
            }
        }

        

        // 404s
        return Response.redirect("/", 404);
    },
    
});
console.log(`Listening on ${server.url}`);

