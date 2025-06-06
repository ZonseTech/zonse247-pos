import React from 'react'
import { useField } from 'formik';
import Label from './Label';
import HelperText from './HelperText';
import Select from './Select';

interface Option {
	value: string;
	label: string;
}

interface FormSelectBoxProps {
	label: string;
	id?: string;
	name: string;
	required?: boolean;
	options: Option[];
}

const FormSelectBox: React.FC<FormSelectBoxProps> = ({ label, id, name, required, options }) => {
	const [field, meta] = useField(name);

	return (
		<div>
			<Label htmlFor={id || name}>
				{label} {required && <span className='text-red-500'>*</span>}
			</Label>

			<Select {...field} id={id || name} className="p-3 form-select block w-full">
				<option value="" label="Select option" />
				{options.map(option => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>

			{meta.touched && meta.error ? (
				<HelperText valid={false}>
					{meta.error}
				</HelperText>
			) : null}
		</div>
	);
}

export default FormSelectBox;
