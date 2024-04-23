import Comment from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { getCommentsForPost } from "../services/comment.service";
import { getAllPosts, getPostsForUser } from "../services/post.service";
import { getUserById, getUserByUsername } from "../services/user.service";
import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";

const PROFILE_PARTIALS = [{ folder: 'login', file: 'loginForm'}]; //! update to correct partials for profile page
const TITLE = 'fakebuk - profile';

const buttons = [
    { icon: 'heart', label: 'Like', path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' },
    { icon: 'message-circle', label: 'Comment', path: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' },
    { icon: 'bookmark', label: 'Save', path: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
];
const postHeaderTemplate = compileTemplate('../client/components/post/postHeader.hbs');
const newPostFormTemplate = compileTemplate('../client/components/forms/newPostForm.hbs');
const postactionsTemplate = compileTemplate('../client/components/post/postActions.hbs');
const commentTemplate = compileTemplate('../client/components/comment/comment.hbs');
const commentFormTemplate = compileTemplate('../client/components/comment/commentForm.hbs');
const postTemplate = compileTemplate('../client/components/post/post.hbs');
const profileInfoTemplate = compileTemplate('../client/components/profile/profileInfo.hbs');
const updateProfilePictureTemplate = compileTemplate('../client/scripts/updateProfilePicture.hbs');

export async function profileRoute(req: Request): Promise<Response> {
    const templates = getCommonTemplates();
    const partials = registerPartials(PROFILE_PARTIALS);
    const profileTemplate = compileTemplate('../client/components/profile/profile.hbs');

    //#region user
    let username = req.url.split('/')[4];
    const user = await getUserByUsername(username);

    let profile_info = '';

    let new_post_form = '';
    let this_user_posts: Post[] = [];
    let all_users_posts: Post[] = [];

    let post_comments: string[] = [];
    let user_posts: string[] = [];
    let all_posts: string[] = [];

    if (user) {
        let profile_picture = user.profile_picture;
        let initials = `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`;
        let full_name = `${user.first_name} ${user.last_name}`;
        let username = user.username;
        new_post_form = newPostFormTemplate({ user_id: user.user_id });

        this_user_posts = await getPostsForUser(user);

        profile_info = profileInfoTemplate({ profile_picture: profile_picture, user_initials: initials, user_fullname: full_name, username: username, user_bio: 'Bio goes here'});

        const postsPromises = this_user_posts.map(async (post) => {
            return getPostData(post, user, templates);
        });
        user_posts = (await Promise.all(postsPromises)).filter(Boolean) as string[];

        all_users_posts = await getAllPosts();

        const allPostsPromises = all_users_posts.map(async (post) => {
            if (post.user_id === user.user_id) {
                return;
            }
            return getPostData(post, user, templates);
        });
        all_posts = (await Promise.all(allPostsPromises)).filter(Boolean) as string[];
    }
    //#endregion

    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate(partials),
        _body_: profileTemplate({ profile_info: profile_info, new_post_form: new_post_form, posts: user_posts, all_posts: all_posts }),
        _footer_: partials['footer'], 
        _script_: updateProfilePictureTemplate({})
    };


    const html = templates.layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200 });
}

const getPostData = async (post:Post, user: User, templates: any) => {
    const postUser = await getUserById(post.user_id);
    if (!postUser) {
        console.log(`No user found for post ${post.post_id}`);
        return;
    }

    let postUserPicture = postUser.profile_picture;
    let postUserInitials = `${postUser.first_name?.charAt(0) ?? ''}${postUser.last_name?.charAt(0) ?? ''}`;
    let postUserFullName = `${postUser.first_name} ${postUser.last_name}`;
    let postUsername = postUser.username;

    let post_header = postHeaderTemplate({ profile_picture: postUserPicture, user_initials: postUserInitials, user_fullname: postUserFullName, username: postUsername, post_description: post.content});
    let post_actions = postactionsTemplate({ buttons: buttons });
    let comment_form = commentFormTemplate({ profile_picture: postUserPicture, user_initials: postUserInitials, user_id: user.user_id, post_id: post.post_id });

    let comments: Comment[] = await getCommentsForPost(post);
    const commentsPromises = comments.map(async (comment) => {
        let commentData = await getCommentData(comment, commentTemplate);
        return commentData;
    });
    const postComments = await Promise.all(commentsPromises);

    let postTemplateData = postTemplate({ post_header: post_header, post_actions: post_actions, comment_form: comment_form , comments: postComments});
    return postTemplateData;
};

const getCommentData = async (comment: Comment, commentTemplate: any) => {
    let commenter = await getUserById(comment.user_id);
    if (!commenter) {
        console.log(`No user found for comment ${comment.comment_id}`);
        return;
    }
    let commenter_picture = commenter.profile_picture;
    let commenter_initials = `${commenter.first_name?.charAt(0) ?? ''}${commenter.last_name?.charAt(0) ?? ''}`;
    let commenter_name = `${commenter.first_name} ${commenter.last_name}`;
    let commented_at = comment.created_at.toUTCString();
    let commentContent = comment.content;
    let cmnt = commentTemplate({ commenter_picture: commenter_picture, commenter_initials: commenter_initials, commenter_name: commenter_name, commented_at: commented_at, comment: commentContent });
    return cmnt;
}