// server/templateUtils.tsx
import Handlebars = require("handlebars");
import fs = require("fs");
import path = require("path");
import { readFile } from 'fs/promises';

export const compileTemplate = (templatePath: string) => {
    const template = fs.readFileSync(path.resolve(__dirname, templatePath), 'utf8');
    return Handlebars.compile(template);
}

const TEMPLATE_PATHS = {
    style: '../client/templates/style.hbs',
    meta: '../client/templates/meta.hbs',
    link: '../client/templates/link.hbs',
    layout: '../client/templates/layout.hbs',
};

export const getCommonTemplates = (): Record<string, (data: any) => string> => {
    const templates: Record<string, (data: any) => string> = {};

    for (const [key, path] of Object.entries(TEMPLATE_PATHS)) {
        templates[`${key}Template`] = compileTemplate(path);
    }

    return templates;
};

type PartialInfo = {
    folder: string;
    file: string;
};

export const registerPartials = (additionalPartials?: PartialInfo[]) => {
    const commonPartials: PartialInfo[] = [
        { folder: 'footer', file: 'footer' },
        { folder: 'button', file: 'button' },
        { folder: 'form', file: 'form' }
    ];
    const allPartials = [...commonPartials, ...(additionalPartials || [])];
    let partials: { [key: string]: string } = {};
    for (const partial of allPartials) {
        const partialContent = fs.readFileSync(path.resolve(__dirname, `../client/components/${partial.folder}/${partial.file}.hbs`), 'utf8');
        Handlebars.registerPartial(partial.file, partialContent);
        partials[partial.file] = partialContent;
    }
    return partials;
}

const COMMON_CSS = [
    { folder: 'styles', file: 'main' },
    { folder: 'components/button', file: 'button' },
    { folder: 'components/form', file: 'form' },
    { folder: 'components/input', file: 'input' },
    { folder: 'components/footer', file: 'footer' },
    { folder: 'components/label', file: 'label' }
];

export const getCss = async (components: { folder: string, file: string }[]) => {
    let css = '';
    const allComponents = [...COMMON_CSS, ...components];
    for (const { folder, file } of allComponents) {
        const cssPath = path.join(__dirname, `../client/${folder}/${file}.css`);
        try {
            css += await readFile(cssPath, 'utf-8');
        } catch (err) {
            console.error(`Failed to load CSS for component ${file} in folder ${folder}:`, err);
        }
    }
    return css;
}