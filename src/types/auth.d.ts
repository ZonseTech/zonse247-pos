interface AccountActivationProps {
	authToken: string;
	clientId: string;
}

interface AccountActivationResponse {
	user: User;
	token: string;
	message: string;
}
