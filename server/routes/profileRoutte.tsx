import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");
import { addComment, addPost, deleteAllComments, deleteAllPosts, getCommentsForPost, getPostsForUser, getUserById, getUserByUsername } from "../database";
import { Post } from "../models/Post";
import Comment from "../models/Comment";

export async function profileRoute(req: Request): Promise<Response> {
    const postHeaderTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/postHeader.hbs'), 'utf8'));
    const newPostFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/forms/newPostForm.hbs'), 'utf8'));
    const postactionsTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/postActions.hbs'), 'utf8'));
    const commentTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/comment.hbs'), 'utf8'));
    const commentFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/commentForm.hbs'), 'utf8'));
    const postTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/post.hbs'), 'utf8'));
    const profileInfoTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/user/profileInfo.hbs'), 'utf8'));
    const profileTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/user/profile.hbs'), 'utf8'));
    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/meta.hbs'), 'utf8'));
    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/link.hbs'), 'utf8'));
    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/layout.hbs'), 'utf8'));
    const updateProfilePictureTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/updateProfilePicture.hbs'), 'utf8'));


    let username = req.url.split('/')[4];
    const user = await getUserByUsername(username);
    let name: string = 'Jhin Deu';
    let profile_picture: string = 'https://via.placeholder.com/40';
    let initials: string = 'JD';
    let posts: Post[] = [];
    let comments: Comment[] = [];
    let postHeader1 = {}
    let postTemplate1 = {}
    let commentTemplate1 = {}

    const allPosts: {}[] = [];
    const allComments = [];
    
    const buttons = [
        { icon: 'heart', label: 'Like', path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' },
        { icon: 'message-circle', label: 'Comment', path: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' },
        { icon: 'bookmark', label: 'Save', path: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
    ];

    if (user) {
        name = `${user?.first_name} ${user?.last_name}`;
        profile_picture = user.profile_picture as string;
        initials = `${user?.first_name?.charAt(0) ?? ''}${user?.last_name?.charAt(0) ?? ''}`.toUpperCase();
        posts = await getPostsForUser(user);
        for (const post of posts) {
            postHeader1 = { profile_picture: profile_picture, user_initials: initials, user_fullname: name, username: user.username, post_description: post.content}
            comments = await getCommentsForPost(post);
            for (const comment of comments) {
                const commenter = await getUserById(comment.user_id);
                if (!commenter) {
                    continue;
                }
                commentTemplate1 = { commenter_picture: commenter.profile_picture, commenter_initials: `${commenter.first_name?.charAt(0) ?? ''}${commenter.last_name?.charAt(0) ?? ''}`.toUpperCase(), commenter_fullname: `${commenter.first_name} ${commenter.last_name}`, comment: comment.content, commented_at: comment.created_at.toUTCString() }
                allComments.push(commentTemplate(commentTemplate1));
            }
            postTemplate1 = { post_header: postHeaderTemplate(postHeader1), post_actions: postactionsTemplate({ buttons: buttons }), comments: allComments, comment_form: commentFormTemplate({ user_initials: initials, profile_picture: profile_picture }) }
            allPosts.push(postTemplate(postTemplate1));
        }
    } else {
        username = 'jhindeu4'
    }
    const newPostForm = newPostFormTemplate({});


    const profileInfo = profileInfoTemplate({ user_image: profile_picture, user_initials: initials, user_bio: 'This is a bio', user_fullname: name, username: username, user_location: 'Somewhere' });


    const profile = profileTemplate({ new_post_form: newPostForm, initials: initials, profile_info: profileInfo, name: name, posts: allPosts });
    const meta = metaTemplate({});
    const link = linkTemplate({});
    var handlebars = require('handlebars');
    var footer = fs.readFileSync(path.resolve(__dirname, '../../client/templates/partials/footer.hbs'), 'utf8');
    handlebars.registerPartial('footer', footer);

    const updateProfilePicture = updateProfilePictureTemplate({});

    const html = layoutTemplate({
        _meta_: meta,
        _link_: link,
        _title_: `fakebuk - ${username}`,
        _style_: '',
        _body_: profile,
        _footer_: ``,
        _script_: updateProfilePicture
    });

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200 });
}
