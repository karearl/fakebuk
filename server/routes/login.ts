import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";

const LOGIN_PAGE_PARTIALS = ['loginFormDiv'];
const TITLE = 'fakebuk - login or sign up';

export const loginRoute = (_: Request) => {
    const templates = getCommonTemplates();
    const partials = registerPartials(LOGIN_PAGE_PARTIALS);
    const loginFormTemplate = compileTemplate('../client/templates/forms/loginForm.hbs');

    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate(partials),
        _body_: loginFormTemplate({}),
        _footer_: partials['footer'], 
        _script_: null
    };
    
    const html = templates.layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}