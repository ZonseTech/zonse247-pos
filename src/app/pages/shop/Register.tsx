import type { Dispatch, FunctionComponent, SetStateAction } from "react"
import { useState } from "react"
import * as Yup from 'yup';
import AuthLayout from "../../layouts/AuthLayout"
import { Form, Formik } from "formik"
import FormWrapper from "../../components/FormWrapper"
import { Alert, Button, } from "../../components"
import { useAuth } from "../../context/AuthProvider"
import { useNavigate } from "react-router"
import { ROUTES } from "../../utils/constants"
import { toast } from "react-toastify"
import FormInput from "../../components/FormInput";
import { Link } from "react-router-dom";

const Register: FunctionComponent = () => {
	const auth = useAuth()
	const navigate = useNavigate();
	const [authError, setAuthError]: [string, Dispatch<SetStateAction<string>>] = useState('')

	const registerProps: ShopVerificationParams = {
		clientId: '',
		authToken: '',
	}

	const registerValidationSchema: Yup.ObjectSchema<{
		authToken: string;
		clientId: string;
	}, Yup.AnyObject, {
		authToken: undefined;
		clientId: undefined;
	}, ""> = Yup.object({
		authToken: Yup.string()
			.required('authToken is required'),

		clientId: Yup.string()
			.required('Please enter your clientId'),
	})
	const handleSubmit = async (values: ShopVerificationParams): Promise<void> => {
		try {

			const shop = await auth.signup(values)

			toast.success('Welcome back! ' + shop)

			navigate(ROUTES.DASHBOARD);
			location.reload()
		} catch (error: any) {
			setAuthError(error.message);
		}
	}

	return (
		<AuthLayout>
			<Formik
				initialValues={registerProps}
				validationSchema={registerValidationSchema}
				onSubmit={handleSubmit}
			>
				{({ isSubmitting }) => (
					<Form>

						<h1 className="mb-4 text-center text-gray-700 font-semibold text-xl">
							Let's active admin account for your business
						</h1>

						<FormWrapper>
							{(authError) && <Alert type="danger"><span>{authError}</span></Alert>}

							<FormInput label='client ID' id='clientId' name='clientId' type='password' step={2} required placeholder="***************" />

							<FormInput label='auth token' id='authToken' name='authToken' type='password' step={3} required placeholder="***************" />

							<Button type='submit' className="mt-1 mb-8 bg-[#102f4f]" block loading={isSubmitting}>
								Create account
							</Button>
						</FormWrapper>

						<div className="text-center text-xs text-gray-500 mt-4">
							Already have an account?{' '}
							<Link
								to={ROUTES.LOGIN}
								className="text-[#102f4f] dark:text-white hover:underline cursor-pointer"
							>
								Jump right back in!
							</Link>
						</div>

					</Form>)}
			</Formik>
		</AuthLayout>
	)
}

export default Register