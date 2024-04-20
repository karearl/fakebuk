import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");
import { getUserByUsername } from "../database";

export async function profileRoute(req: Request): Promise<Response> {
    let username = req.url.split('/')[4];
    const user = await getUserByUsername(username);
    let name: string = 'Jhin Deu';
    let profile_picture: string = 'https://via.placeholder.com/40';
    let initials: string = 'JD';

    if (user) {
        name = user.first_name + ' ' + user.last_name;
        profile_picture = user.profile_picture as string;
        initials = `${user?.first_name?.charAt(0) ?? ''}${user?.last_name?.charAt(0) ?? ''}`.toUpperCase();
    } else {
        username = 'jhindeu4'
    }

    const user_name = `${user?.first_name} ${user?.last_name}`;

    const postHeaderTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/postHeader.hbs'), 'utf8'));
    const postHeader = postHeaderTemplate({
        user_initials: initials,
        profile_picture: profile_picture,
        user_fullname: user_name,
        username: username,
        post_description: 'Post description :)',
        post_images: [
            'https://via.placeholder.com/100',
            'https://via.placeholder.com/50'
        ]
    });

    const postHeader2 = postHeaderTemplate({
        user_initials: 'AI',
        profile_picture: 'https://via.placeholder.com/40',
        user_fullname: 'AI Bot',
        username: 'ai_bot',
        post_description: 'This is a random post :)',
        post_images: [
            'https://via.placeholder.com/300',
            'https://via.placeholder.com/150'
        ]
    });

    const buttons = [
        { icon: 'heart', label: 'Like', path: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' },
        { icon: 'message-circle', label: 'Comment', path: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' },
        { icon: 'bookmark', label: 'Save', path: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
    ];

    const postactionsTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/postActions.hbs'), 'utf8'));
    const postActions = postactionsTemplate({ buttons: buttons });

    const commentTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/comment.hbs'), 'utf8'));
    const comment = commentTemplate({ commenter_initials: 'JD', commenter_fullname: 'John Doe', commented_at: '2021-01-01', comment: 'This is a comment' });

    const comment2 = commentTemplate({ commenter_initials: 'AI', commenter_fullname: 'AI Bot', commented_at: '2022-01-01', comment: 'This is a random comment' });

    const commentFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/commentForm.hbs'), 'utf8'));
    const commentForm = commentFormTemplate({ user_initials: initials, profile_picture: profile_picture });

    const postTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/post/post.hbs'), 'utf8'));
    const post = postTemplate({ post_header: postHeader, post_actions: postActions, comments: [comment, comment2, comment], comment_form: commentForm });

    const post2 = postTemplate({ post_header: postHeader2, post_actions: postActions, comments: [comment2, comment], comment_form: commentForm });

    const profileInfoTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/user/profileInfo.hbs'), 'utf8'));
    const profileInfo = profileInfoTemplate({ user_image: profile_picture, user_initials: initials, user_bio: 'This is a bio', user_fullname: name, username: username, user_location: 'Somewhere' });

    const profileTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/user/profile.hbs'), 'utf8'));
    const profile = profileTemplate({ initials: initials, profile_info: profileInfo, name: user_name, posts: [post, post2, post2, post] });

    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/meta.hbs'), 'utf8'));
    const meta = metaTemplate({});

    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/link.hbs'), 'utf8'));
    const link = linkTemplate({});

    var handlebars = require('handlebars');
    var footer = fs.readFileSync(path.resolve(__dirname, '../../client/templates/partials/footer.hbs'), 'utf8');
    handlebars.registerPartial('footer', footer);

    const updateProfilePictureTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/updateProfilePicture.hbs'), 'utf8'));
    const updateProfilePicture = updateProfilePictureTemplate({});

    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/layout.hbs'), 'utf8'));
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
