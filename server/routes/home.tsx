import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookieParser } from '../middlewares/cookieParser';
import { getUserById } from "../services/user.service";
import { loginRoute } from "./login";

export const homeRoute = async (req: Request) => {
    const cookies = cookieParser(req)

    if (cookies.token === undefined) return loginRoute(req);

    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded: JwtPayload = jwt.verify(cookies.token, secret) as JwtPayload;
        const user = await getUserById(decoded.id);

        if (!user) return new Response('User not found', { status: 404 })

        const headers = new Headers();
        headers.append('Location', '/users/' + user.username);
        return new Response(null, { headers: headers, status: 303 });

    } catch (err) {
        return loginRoute(req);
    }
};