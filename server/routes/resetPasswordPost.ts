import { resetPassword } from "../services/auth.service";
import { getUserFromToken } from "../services/user.service";

export const resetPasswordPostRoute = async (req: Request) => {
    const formData = await req.formData();

    const token = formData.get("resetToken");
    const password = formData.get("newPassword");

    const user = await getUserFromToken(token as string);
    if (user && token && password) {
        await resetPassword(user.email, token as string, password as string);
        return Response.redirect("/login", 303);
    } else {
        return Response.redirect("/");
    }
};