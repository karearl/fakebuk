import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";

const REGISTRATION_PARTIALS = ['registrationFormDiv'];
const TITLE = 'fakebuk - sign up';

export async function registrationRoute(_: Request): Promise<Response> {
    const templates = getCommonTemplates();
    const partials = registerPartials(REGISTRATION_PARTIALS);
    const registrationFormTemplate = compileTemplate('../client/templates/forms/registrationForm.hbs');
    const checkEmailExists = compileTemplate('../client/templates/scripts/checkEmailExistsScript.hbs');

    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate(partials),
        _body_: registrationFormTemplate({}),
        _footer_: partials['footer'], 
        _script_: checkEmailExists({})
    };
    
    const html = templates.layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}