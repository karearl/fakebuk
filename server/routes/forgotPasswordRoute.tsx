import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function forgotPasswordRoute(_: Request): Promise<Response> {
    const forgotPasswordTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/forms/forgotPasswordForm.hbs'), 'utf8'));
    const forgotPasswordScriptTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/forgotPassword.hbs'), 'utf8'));
    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/meta.hbs'), 'utf8'));
    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/link.hbs'), 'utf8'));
    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/layout.hbs'), 'utf8'));

    var footer = fs.readFileSync(path.resolve(__dirname, '../../client/templates/partials/footer.hbs'), 'utf8');

    const forgotPassword = forgotPasswordTemplate({});
    const forgotPasswordScript = forgotPasswordScriptTemplate({});
    const meta = metaTemplate({});
    const link = linkTemplate({});
    var handlebars = require('handlebars');
    handlebars.registerPartial('footer', footer);
    
    const html = layoutTemplate({ 
        _meta_: meta,
        _link_: link,
        _title_: 'fakebuk - forgot password', 
        _style_: '',
        _body_:  forgotPassword,
        _footer_: footer, 
        _script_: forgotPasswordScript
    });

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}