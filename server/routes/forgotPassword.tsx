import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";

const FORGOT_PASSWORD_PARTIALS = ['forgotPasswordFormDiv'];
const TITLE = 'fakebuk - forgot password';

export async function forgotPasswordRoute(_: Request): Promise<Response> {
    const templates = getCommonTemplates();
    const partials = registerPartials(FORGOT_PASSWORD_PARTIALS);
    const forgotPasswordTemplate = compileTemplate('../client/templates/forms/forgotPasswordForm.hbs');
    const forgotPasswordScriptTemplate = compileTemplate('../client/templates/scripts/forgotPasswordScript.hbs');

    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate(partials),
        _body_: forgotPasswordTemplate({}),
        _footer_: partials['footer'], 
        _script_: forgotPasswordScriptTemplate({})
    };

    const html = templates.layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}