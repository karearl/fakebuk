export const logoutRoute = async (_: Request) => {
    const headers = new Headers();
    headers.append('Location', '/');
    headers.append('Set-Cookie', `token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
    return new Response(null, {headers: headers, status: 303});
}