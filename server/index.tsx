import {
    setupDatabase,
    registerUser,
    getUserById,
    checkPassword,
    getUserByEmail,
    checkEmailExists,
    getUserByUsername,
    resetPassword,
    generateResetToken,
    storeResetToken,
    getUserFromToken,
    getSafeAllUsers,
    sendResetTokenEmail,
    isTokenExpired,
    updateProfilePicture,
    addPost,
} from "./database";

import jwt, { JwtPayload } from 'jsonwebtoken';
require('dotenv').config();
import { loginRoute } from "./routes/loginRoute";
import { resetPasswordRoute } from "./routes/resetPasswordRoute";
import { forgotPasswordRoute } from "./routes/forgotPasswordRoute";
import { registrationRoute } from "./routes/registrationRoute";
import { profileRoute } from "./routes/profileRoutte";

setupDatabase().then(() => console.log("Database setup complete")).catch((err) => { console.error(err); });

export const server = Bun.serve({
    async fetch(req: Request) {
        const url: URL = new URL(req.url);
        const path = url.pathname;

        // GET requests
        if (req.method === "GET") {
            if (path === "/") {
                const cookies = req.headers.get("Cookie");
                const items = cookies ? cookies.split('; ') : [];
                const localCookies: { [key: string]: string } = {};
                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });
        
                if (localCookies.token === undefined) return loginRoute(req);
        
                try {
                    // Verify the token and extract the user ID
                    const secret = process.env.JWT_SECRET as string;
                    const decoded: JwtPayload = jwt.verify(localCookies.token, secret) as JwtPayload;
                    const user = await getUserById(decoded.id);

                    if (!user) {
                        return new Response('User not found', { status: 404 });
                    }

                    // The user is authenticated, redirect to their profile
                    const headers = new Headers();
                    headers.append('Location', '/users/' + user.username);
                    return new Response(null, { headers: headers, status: 303 });
        
                } catch (err) {
                    // Invalid token, redirect to login
                    return loginRoute(req);
                }
            }
            if (path === "/logout") {
                const headers = new Headers();
                headers.append('Location', '/');
                headers.append('Set-Cookie', `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
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
        }


        // POST requests
        if (req.method === "POST") {
            if (path === "/login") {
                const data = await req.formData();
                const email = data.get("email");
                const password = data.get("password");

                if (!email || !password) {
                    return loginRoute(req);
                } 

                const user = await checkPassword(email.toString(), password.toString());

                if (user) {
                    const headers = new Headers();
                    const userData = await getUserByUsername(user.username);
                    const secret = process.env.JWT_SECRET as string;
                    const token = jwt.sign({ id: user.user_id }, secret, { expiresIn: '1h' });
                    const body = JSON.stringify(userData)
                    headers.append('Location', `/users/${user.username}`);
                    headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=3600;`);


                    return new Response(body, {
                        headers: headers,
                        status: 303
                    });
                } else {
                    return loginRoute(req);
                }
            }

            if (path === "/resetPassword") {
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

            if (path === "/checkEmailExists") {
                const data = await req.json();
                const email = data.email;
                const emailExists = await checkEmailExists(email);
                return new Response(JSON.stringify({ emailExists: !!emailExists }), { status: 200 });
            }

            if (path === "/register") {
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

                    const emailExists = await checkEmailExists(email as string);
                    if (emailExists) {
                        return Response.redirect("/register", 303);
                    }



                    console.log('Registering user with email: ', email);
                    await registerUser(
                        email,
                        password,
                        firstName,
                        lastName,
                        new Date(birthDate),
                        gender
                    );

                    const user = await getUserByEmail(email as string);
                    console.log('User registered: ', user?.username);
                    if (user) {
                        const headers = new Headers();
                        const userData = await getUserByUsername(user.username);
                        const secret = process.env.JWT_SECRET as string;
                        const token = jwt.sign({ id: user.user_id }, secret, { expiresIn: '1h' });
                        const body = JSON.stringify(userData)
                        headers.append('Location', `/users/${user.username}`);
                        headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=3600;`);
                        return new Response(body, {
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

            if (path === "/updateProfilePicture") {
                const cookies = req.headers.get("Cookie");
                const items = cookies ? cookies.split('; ') : [];
                const localCookies: { [key: string]: string } = {};
                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });
                const { url } = await req.json();
                const token = localCookies.token;
                if (!token) {
                    return new Response('Token cookie missing', { status: 401 });
                }
                try {   
                    await updateProfilePicture(token, url);
                    return new Response(null, { status: 204 });
                } catch (error) {
                    console.error('Error updating profile picture:', error);
                    return new Response('Error updating profile picture', { status: 500 });
                }
            }

            if (path === "/post") {
                const cookies = req.headers.get("Cookie");
                const items = cookies ? cookies.split('; ') : [];
                const localCookies: { [key: string]: string } = {};
                items.forEach((item) => {
                    const [name, value] = item.split('=');
                    localCookies[name] = value;
                });
                const { content } = await req.json();
                const token = localCookies.token;
                if (!token) {
                    return new Response('Token cookie missing', { status: 401 });
                }
                try {
                    await addPost(token, content);
                    return new Response(null, { status: 204 });
                } catch (error) {
                    console.error('Error adding post:', error);
                    return new Response('Error adding post', { status: 500 });
                }

            }
        }        

        // 404s
        return Response.redirect("/", 404);
    },
    
});
console.log(`Listening on ${server.url}`);

