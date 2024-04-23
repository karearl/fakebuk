import { checkEmailExists } from "../services/user.service";

export const checkEmailExistsPostRoute = async (req: Request) => {
    const data = await req.json();
    const email = data.email;
    const emailExists = await checkEmailExists(email);
    return new Response(JSON.stringify({ emailExists: !!emailExists }), { status: 200 });
};