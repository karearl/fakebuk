import { compileTemplate, getCommonTemplates, registerPartials } from "../templateUtils";

const TITLE = '404 - Page Not Found';
const NOT_FOUND_PARTIALS = undefined;

export const notFoundRoute = () => {
    console.log(`Received request for 404 route`);

    const partials = registerPartials(NOT_FOUND_PARTIALS)
    const templates = getCommonTemplates();
    const notFoundTemplate = compileTemplate('../client/templates/404.hbs');

    const templateData = {
        _meta_: templates.metaTemplate({}),
        _link_: templates.linkTemplate({}),
        _title_: TITLE, 
        _style_: templates.styleTemplate({}),
        _body_: notFoundTemplate({}),
        _footer_: partials['footer'], 
        _script_: null
    };
    
    const html = templates.layoutTemplate(templateData);

    console.log(`Sending response for 404 route`);
    return new Response(html, { headers: { "Content-Type": "text/html" }, status: 404});
}