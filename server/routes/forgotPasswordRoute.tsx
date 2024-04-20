import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function forgotPasswordRoute(req: Request): Promise<Response> {
    const forgotPasswordTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/forms/forgotPasswordForm.hbs'), 'utf8'));
    const forgotPassword = forgotPasswordTemplate({});

    const forgotPasswordScriptTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/scripts/forgotPassword.hbs'), 'utf8'));
    const forgotPasswordScript = forgotPasswordScriptTemplate({});

    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/meta.hbs'), 'utf8'));
    const meta = metaTemplate({});

    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/link.hbs'), 'utf8'));
    const link = linkTemplate({});

    const footerTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/footer.hbs'), 'utf8'));
    const footer = footerTemplate({});

    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/layout.hbs'), 'utf8'));
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