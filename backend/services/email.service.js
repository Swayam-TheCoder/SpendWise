import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM;

export const sendVerificationEmail = async ({ email, token }) => {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your SpendWise account",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #111827;
      ">
        <h2 style="margin-bottom: 16px;">
          Welcome to SpendWise
        </h2>

        <p style="line-height: 1.6;">
          Thanks for creating your SpendWise account.
          Please verify your email address to continue.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display:inline-block;
            margin-top:16px;
            padding:12px 20px;
            background:#000000;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:600;
          "
        >
          Verify Email
        </a>

        <p style="
          margin-top:24px;
          color:#6b7280;
          font-size:14px;
          line-height:1.5;
        ">
          This verification link will expire in 15 minutes.
        </p>
      </div>
    `,
  });

  if (error) {
  console.error("RESEND VERIFICATION ERROR:", {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    details: error,
  });

  throw error;
}

  console.log("Verification email sent:", data?.id);
  return data;
};

export const sendPasswordResetEmail = async ({ email, token }) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your SpendWise password",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 32px;
        color: #111827;
      ">
        <h2 style="margin-bottom: 16px;">
          Reset your SpendWise password
        </h2>

        <p style="line-height: 1.6;">
          We received a request to reset your SpendWise password.
        </p>

        <p style="line-height: 1.6;">
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            margin-top:16px;
            padding:12px 20px;
            background:#000000;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:600;
          "
        >
          Reset Password
        </a>

        <p style="
          margin-top:24px;
          color:#6b7280;
          font-size:14px;
          line-height:1.5;
        ">
          This link expires in 15 minutes.
        </p>

        <p style="
          color:#6b7280;
          font-size:14px;
          line-height:1.5;
        ">
          If you didn't request this password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
  console.error("RESEND PASSWORD RESET ERROR:", {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    details: error,
  });

  throw error;
}

  console.log("Password reset email sent:", data?.id);
  return data;
};