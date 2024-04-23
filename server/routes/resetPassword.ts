import { getUserByEmail } from "../services/user.service";
import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";
import { forgotPasswordRoute } from "./forgotPassword";
import { homeRoute } from "./home";

const RESET_PASSWORD_PARTIALS = ['resetPasswordFormDiv'];
const TITLE = 'fakebuk - reset password';

export async function resetPasswordRoute(_: Request): Promise<Response> {
    const templates = getCommonTemplates();
    const partials = registerPartials(RESET_PASSWORD_PARTIALS);
    const resetPasswordFormTemplate = compileTemplate('../client/templates/forms/resetPasswordForm.hbs');
    const resetPasswordTemplate = compileTemplate('../client/templates/scripts/resetPassword.hbs');
    
    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate(partials),
        _body_: resetPasswordFormTemplate({}),
        _footer_: partials['footer'], 
        _script_: resetPasswordTemplate({})
    };
    
    const html = templates.layoutTemplate(templateData);

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