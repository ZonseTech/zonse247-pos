import Label from "../Label";

const LabelArea = ({ label }: any) => {
	return (
		<Label className="col-span-4 sm:col-span-2 font-medium text-sm">
			{label}
		</Label>
	);
};

export default LabelArea;
