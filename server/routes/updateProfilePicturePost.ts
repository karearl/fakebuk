import { cookieParser } from "../middlewares/cookieParser";
import { updateProfilePicture } from "../services/user.service";

export const updateProfilePicturePostRoute = async (req: Request) => {
    const cookies = cookieParser(req);
    const { url } = await req.json();
    const token = cookies.token;
    if (!token) return new Response('Token cookie missing', { status: 401 });
    try {   
        await updateProfilePicture(token, url);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return new Response('Error updating profile picture', { status: 500 });
    }
}