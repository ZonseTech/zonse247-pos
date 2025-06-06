import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

const ComponentLoader: React.FunctionComponent<{ loading: boolean }> = ({ loading }) => {
	return (
		<div className="text-lg text-center py-6">
			<ScaleLoader
				color="rgb(38 157 255 / var(--tw-bg-opacity))"
				loading={loading}
				height={25}
				width={3}
				radius={3}
				margin={4}
				barCount={5}
			/>
		</div>
	);
};

export default ComponentLoader;
