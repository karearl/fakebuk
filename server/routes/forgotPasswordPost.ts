import { generateResetToken, isTokenExpired, sendResetTokenEmail, storeResetToken } from "../services/auth.service";
import { getUserByEmail } from "../services/user.service";

export const forgotPasswordPostRoute = async (req: Request) => {
    const data = await req.json();
    const email = data.email;
    const user = await getUserByEmail(email);

    if (!user) {
        return new Response("/forgotPassword POST, user is null", { status: 404 });
    }

    let resetToken = user.reset_token;
    let expiration;

    if (!resetToken || (user.reset_token_expiration && await isTokenExpired(user.reset_token_expiration))) {
        resetToken = generateResetToken();
        await storeResetToken(user.email, resetToken);
        expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
    } else {
        expiration = new Date(user.reset_token_expiration as unknown as Date);
    }

    await sendResetTokenEmail(user.email, resetToken, expiration);
    return new Response(JSON.stringify({ email: email, resetToken: resetToken, expiration: expiration }), { status: 200 });
}