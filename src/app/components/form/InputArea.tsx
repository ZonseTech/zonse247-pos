import Input from '../Input';

const InputArea = ({
	defaultValue,
	name,
	type,
	placeholder,
}: any) => {
	return (
		<>
			<Input
				defaultValue={defaultValue}
				type={type}
				placeholder={placeholder}
				name={name}
			/>
		</>
	);
};

export default InputArea;
