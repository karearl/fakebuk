import { compileTemplate, getCommonTemplates, registerPartials, getCss } from "../templateUtils";

const TITLE = 'fakebuk - login or sign up';

export const loginRoute = async (_: Request) => {
    const partials = registerPartials();
    const loginFormCss = await getCss([{ folder: 'components/login', file: 'login' }]);

    const templateData = {
        _meta_: getCommonTemplates().metaTemplate({}),
        _link_: getCommonTemplates().linkTemplate({}),
        _title_: TITLE,
        _style_: loginFormCss,
        _body_: compileTemplate('../client/components/login/loginForm.hbs')({}),
        _footer_: partials['footer'],
        _script_: null
    };

    const html = getCommonTemplates().layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200 });
}