import jwt from "jsonwebtoken";
import { checkEmailExists, getUserByEmail, getUserByUsername, registerUser } from "../services/user.service";
import { registrationRoute } from "./register";

export const registerPostRoute = async (req: Request) => {
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