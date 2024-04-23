import jwt, { JwtPayload } from "jsonwebtoken";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";


export const addComment = async (token: string, postId: number, content: string) => {
    const secret = process.env.JWT_SECRET as string;
    const decoded: JwtPayload = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new Error('User not found');
    }
    return Comment.create({
        user_id: user.user_id,
        post_id: postId,
        content: content,
        created_at: new Date()
    });
};

export const getCommentsForPost = async (post: Post) => {
    try {
        return Comment.findAll({
            where: {
                post_id: post.post_id
            }
        });
    }
    catch (error) {
        console.error(`Error fetching comments for post ${post.post_id}`, error);
        throw error;
    }
};

export const deleteAllComments = async () => {
    try {
        return Comment.destroy({
            where: {}
        });
    }
    catch (error) {
        console.error('Error deleting all comments:', error);
        throw error;
    }
};