import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";

const loginSchema = z.object({
	email: z.string().email("E-mail inválido"),
	password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	async function onSubmit(data: LoginFormData) {
		setErrorMessage(null);
		const { error } = await signIn(data.email, data.password);
		if (error) {
			// Generic message — does not reveal which field is incorrect (Req 1.3)
			setErrorMessage("E-mail ou senha incorretos.");
		} else {
			navigate("/");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h1>

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							E-mail
						</label>
						<input
							id="email"
							type="email"
							autoComplete="email"
							{...register("email")}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-red-600">
								{errors.email.message}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Senha
						</label>
						<input
							id="password"
							type="password"
							autoComplete="current-password"
							{...register("password")}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						{errors.password && (
							<p className="mt-1 text-xs text-red-600">
								{errors.password.message}
							</p>
						)}
					</div>

					{errorMessage && (
						<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
							{errorMessage}
						</p>
					)}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition-colors"
					>
						{isSubmitting ? "Entrando..." : "Entrar"}
					</button>
				</form>

				<p className="mt-4 text-center text-sm text-gray-600">
					Não tem uma conta?{" "}
					<Link
						to="/register"
						className="text-indigo-600 hover:underline font-medium"
					>
						Criar conta
					</Link>
				</p>
			</div>
		</div>
	);
}
