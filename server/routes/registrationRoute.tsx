import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function registrationRoute(req: Request): Promise<Response> {
    const styleTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/style.hbs'), 'utf8'));
    const style = styleTemplate({});

    const registrationFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/forms/registrationForm.hbs'), 'utf8'));
    const registrationForm = registrationFormTemplate({});

    const checkEmailExists = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../../client/templates/scripts/checkEmailExists.hbs'), 'utf8'));
    const checkEmailExistsScript = checkEmailExists({});

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
        _title_: 'fakebuk - sign up', 
        _style_: style,
        _body_: registrationForm,
        _footer_: footer, 
        _script_: checkEmailExistsScript,
    });

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}