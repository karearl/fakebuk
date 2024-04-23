import { cookieParser } from "../middlewares/cookieParser";
import { addPost } from "../services/post.service";

export const postPostRoute = async (req: Request) => {
    const cookies = cookieParser(req);
    const { content } = await req.json();
    const token = cookies.token;
    if (!token) return new Response('Token cookie missing', { status: 401 });
    try {
        await addPost(token, content);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error adding post:', error);
        return new Response('Error adding post', { status: 500 });
    }
}