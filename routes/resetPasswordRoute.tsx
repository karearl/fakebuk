import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export async function resetPasswordRoute(req: Request): Promise<Response> {
    
        const styleTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/style.hbs'), 'utf8'));
        const style = styleTemplate({});
    
        const resetPasswordFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/resetPasswordForm.hbs'), 'utf8'));
        const resetPasswordForm = resetPasswordFormTemplate({});
    
        const showErrorTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/showError.hbs'), 'utf8'));
        const showError = showErrorTemplate({});
    
        const onLoadTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/onLoad.hbs'), 'utf8'));
        const onLoad = onLoadTemplate({});
    
        const validateFormTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/validateForm.hbs'), 'utf8'));
        const validateForm = validateFormTemplate({});
    
        const metaTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/meta.hbs'), 'utf8'));
        const meta = metaTemplate({});
    
        const linkTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/link.hbs'), 'utf8'));
        const link = linkTemplate({});
    
        const footerTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/footer.hbs'), 'utf8'));
        const footer = footerTemplate({});
    
        const layoutTemplate = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../templates/layout.hbs'), 'utf8'));
        const html = layoutTemplate({ 
            _meta_: meta,
            _link_: link,
            _title_: 'fakebuk - reset password', 
            _style_: style,
            _body_: resetPasswordForm,
            _footer_: footer, 
            _script_: onLoad + showError + validateForm
        });
    
        return new Response(html, { headers: { "Content-Type": "text/html" }, status: 200});

}
