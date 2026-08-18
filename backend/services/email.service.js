import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async ({
  email,
  token,
}) => {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"SpendWise" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your SpendWise account",

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to SpendWise</h2>

        <p>
          Thanks for creating your account.
          Please verify your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#000;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Verify Email
        </a>

        <p>
          This link will expire soon.
        </p>
      </div>
    `,
  });
};


export const sendPasswordResetEmail = async ({
  email,
  token,
}) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"SpendWise" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your SpendWise password",

    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>
          We received a request to reset your SpendWise password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#000;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p>
          This link expires in 15 minutes.
        </p>

        <p>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};