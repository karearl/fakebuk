import { compileTemplate, getCommonTemplates, getCss, registerPartials } from "../templateUtils";

const TITLE = 'fakebuk - forgot password';

export async function forgotPasswordRoute(_: Request): Promise<Response> {
    const partials = registerPartials();
    const loginFormCss = await getCss([{ folder: 'components/forgotPassword', file: 'forgotPassword' }]);
    
    const templateData = {
        _meta_: getCommonTemplates().metaTemplate({}),
        _link_: getCommonTemplates().linkTemplate({}),
        _title_: TITLE,
        _style_: loginFormCss,
        _body_: compileTemplate('../client/components/forgotPassword/forgotPasswordForm.hbs')({}) +
            compileTemplate('../client/scripts/forgotPasswordScript.hbs')({}),
        _footer_: partials['footer'],
        _script_: null
    };


    const html = getCommonTemplates().layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200 });
}