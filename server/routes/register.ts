import { compileTemplate, getCommonTemplates, getCss, registerPartials } from "../templateUtils";

const TITLE = 'fakebuk - sign up';

export async function registrationRoute(_: Request): Promise<Response> {
    const partials = registerPartials();
    const registerFormCss = await getCss([{ folder: 'components/register', file: 'register' }]);

    const templateData = {
        _meta_: getCommonTemplates().metaTemplate({}),
        _link_: getCommonTemplates().linkTemplate({}),
        _title_: TITLE,
        _style_: registerFormCss,
        _body_: compileTemplate('../client/components/register/registrationForm.hbs')({}) +
        compileTemplate('../client/scripts/checkEmailExistsScript.hbs')({}),
        _footer_: partials['footer'],
        _script_: null
    };
    
    const html = getCommonTemplates().layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}