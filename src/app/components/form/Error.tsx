import { Fragment } from "react";

const Error = ({ errorName }: any) => {
	return (
		<Fragment>
			{errorName && (
				<span className="text-red-400 text-sm mt-2">{errorName.message}</span>
			)}
		</Fragment>
	);
};

export default Error;
