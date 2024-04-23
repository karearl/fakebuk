// server/templateUtils.tsx
import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");

export const compileTemplate = (templatePath: string) => {
    const template = fs.readFileSync(path.resolve(__dirname, templatePath), 'utf8');
    return Handlebars.compile(template);
}
export const getCommonTemplates = (): {
    styleTemplate: (data: any) => string;
    metaTemplate: (data: any) => string;
    linkTemplate: (data: any) => string;
    layoutTemplate: (data: any) => string;
} => {
    return {
        styleTemplate: compileTemplate('../client/templates/style.hbs'),
        metaTemplate: compileTemplate('../client/templates/meta.hbs'),
        linkTemplate: compileTemplate('../client/templates/link.hbs'),
        layoutTemplate: compileTemplate('../client/templates/layout.hbs'),
    };
}
export const registerPartials = (additionalPartials?: string[]) => {
    const commonPartials = ['footer', 'button', 'formField'];
    const allPartials = [...commonPartials, ...(additionalPartials || [])];
    let partials: { [key: string]: string } = {};
    for (const partial of allPartials) {
        const partialContent = fs.readFileSync(path.resolve(__dirname, `../client/templates/partials/${partial}.hbs`), 'utf8');
        Handlebars.registerPartial(partial, partialContent);
        partials[partial] = partialContent;
    }
    return partials;
}