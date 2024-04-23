export const cookieParser = (req: Request): { [key: string]: string } => {
    const cookies = req.headers.get("Cookie");
    const items = cookies ? cookies.split('; ') : [];
    const parsedCookies: { [key: string]: string } = {};
    items.forEach((item) => {
        const [name, value] = item.split('=');
        parsedCookies[name] = value;
    });

    return parsedCookies;
};