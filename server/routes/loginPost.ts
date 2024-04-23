import jwt from 'jsonwebtoken';
import { checkPassword, getUserByUsername } from "../services/user.service";
import { loginRoute } from "./login";

export const loginPostRoute = async (req: Request) => {
    const data = await req.formData();
    const email = data.get("email");
    const password = data.get("password");

    if (!email || !password) return loginRoute(req);

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
};