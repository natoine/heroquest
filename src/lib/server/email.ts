import nodemailer from 'nodemailer';
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
	APP_URL
} from '$env/static/private';

function createTransport() {
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465,
		auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
	});
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
	const link = `${APP_URL}/verify-email?token=${token}`;
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: 'HeroQuest — Verify your email',
		html: `
			<div style="font-family: Georgia, serif; background:#0d0700; color:#e8d5b0; padding:40px; max-width:520px; margin:auto; border:1px solid #4a2e10; border-radius:8px;">
				<h1 style="color:#f0a830; font-size:1.8rem; margin-bottom:8px;">⚔️ HeroQuest</h1>
				<p style="margin-bottom:24px;">Welcome, hero! Confirm your email address to enter the dungeon.</p>
				<a href="${link}" style="display:inline-block; padding:12px 28px; background:#c8922a; color:#0d0700; font-weight:bold; text-decoration:none; border-radius:4px; letter-spacing:0.05em; text-transform:uppercase;">
					Verify Email
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#8a7055;">
					This link expires in 24 hours. If you didn't register, ignore this email.
				</p>
			</div>
		`
	});
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
	const link = `${APP_URL}/reset-password?token=${token}`;
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: 'HeroQuest — Reset your password',
		html: `
			<div style="font-family: Georgia, serif; background:#0d0700; color:#e8d5b0; padding:40px; max-width:520px; margin:auto; border:1px solid #4a2e10; border-radius:8px;">
				<h1 style="color:#f0a830; font-size:1.8rem; margin-bottom:8px;">⚔️ HeroQuest</h1>
				<p style="margin-bottom:24px;">A password reset was requested for your account.</p>
				<a href="${link}" style="display:inline-block; padding:12px 28px; background:#c8922a; color:#0d0700; font-weight:bold; text-decoration:none; border-radius:4px; letter-spacing:0.05em; text-transform:uppercase;">
					Reset Password
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#8a7055;">
					This link expires in 1 hour. If you didn't request a reset, ignore this email.
				</p>
			</div>
		`
	});
}
