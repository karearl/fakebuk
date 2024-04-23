import { getUserByEmail } from "../services/user.service";
import { compileTemplate, getCommonTemplates, getCss, registerPartials } from "../templateUtils";
import { forgotPasswordRoute } from "./forgotPassword";
import { homeRoute } from "./home";

const TITLE = 'fakebuk - reset password';

export async function resetPasswordRoute(_: Request): Promise<Response> {
    const partials = registerPartials();
    const resetFormCss = await getCss([{ folder: 'components/resetPassword', file: 'resetPassword' }]);


    const templateData = {
        _meta_: getCommonTemplates().metaTemplate({}),
        _link_: getCommonTemplates().linkTemplate({}),
        _title_: TITLE,
        _style_: resetFormCss,
        _body_: compileTemplate('../client/components/forms/resetPasswordForm.hbs')({}) +
        compileTemplate('../client/scripts/resetPassword.hbs')({}),
        _footer_: partials['footer'],
        _script_: null
    };

    const html = getCommonTemplates().layoutTemplate(templateData);

    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});
}

export const resetPasswordRouteHandler = async (req: Request) => {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email && !token) {
        return forgotPasswordRoute(req);
    }
    const user = await getUserByEmail(email as string);
    if (user && user.reset_token === token) {
        return resetPasswordRoute(req);
    }
    return homeRoute(req);
}