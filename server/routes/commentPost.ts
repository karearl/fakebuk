import { cookieParser } from "../middlewares/cookieParser";
import { addComment } from "../services/comment.service";

export const commentPostRoute = async (req: Request) => {
    const cookies = cookieParser(req);
    const { content, postId } = await req.json();
    const token = cookies.token;
    if (!token) {
        return new Response('Token cookie missing', { status: 401 });
    }
    try {
        await addComment(token, postId, content);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return new Response('Error adding comment', { status: 500 });
    }
};