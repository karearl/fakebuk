import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function loginRoute(req: Request): Promise<Response> {
    const styleTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/style.hbs'), 'utf8'));
    const style = styleTemplate({});

    const loginFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/forms/loginForm.hbs'), 'utf8'));
    const loginForm = loginFormTemplate({});

    const showErrorTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/showError.hbs'), 'utf8'));
    const showError = showErrorTemplate({});

    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/meta.hbs'), 'utf8'));
    const meta = metaTemplate({});

    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/link.hbs'), 'utf8'));
    const link = linkTemplate({});

    var handlebars = require('handlebars');
    var footer = fs.readFileSync(path.resolve(__dirname, '../../client/templates/partials/footer.hbs'), 'utf8');
    handlebars.registerPartial('footer', footer);

    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/layout.hbs'), 'utf8'));
    const html = layoutTemplate({ 
        _meta_: meta,
        _link_: link,
        _title_: 'fakebuk - login or sign up', 
        _style_: style,
        _body_: loginForm,
        _footer_: footer, 
        _script_: showError
    });

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}