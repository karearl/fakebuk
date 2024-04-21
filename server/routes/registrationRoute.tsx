import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function registrationRoute(_: Request): Promise<Response> {
    const styleTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/style.hbs'), 'utf8'));
    const registrationFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/forms/registrationForm.hbs'), 'utf8'));
    const checkEmailExists = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/checkEmailExists.hbs'), 'utf8'));
    const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/meta.hbs'), 'utf8'));
    const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/link.hbs'), 'utf8'));
    const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/layout.hbs'), 'utf8'));

    var footer = fs.readFileSync(path.resolve(__dirname, '../../client/templates/partials/footer.hbs'), 'utf8');

    const style = styleTemplate({});
    const registrationForm = registrationFormTemplate({});
    const checkEmailExistsScript = checkEmailExists({});
    const meta = metaTemplate({});
    const link = linkTemplate({});
    var handlebars = require('handlebars');
    handlebars.registerPartial('footer', footer);
    
    const html = layoutTemplate({ 
        _meta_: meta,
        _link_: link,
        _title_: 'fakebuk - sign up', 
        _style_: style,
        _body_: registrationForm,
        _footer_: footer, 
        _script_: checkEmailExistsScript,
    });

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}