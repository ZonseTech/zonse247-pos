import React, { useContext } from 'react';
import { useField } from 'formik';
import Label from './Label';
import Input from './Input';
import HelperText from './HelperText';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ThemeContext } from '../context/ThemeContext';

interface TextInputProps {
	label: string;
	id?: string;
	name: string;
	type?: string;
	step?: string | number;
	required?: boolean;
	wrapperClass?: string;
	value?: string | number;
	dateFormat?: string;
	showTimeSelect?: boolean;
	timeFormat?: string;
	maxDate?: string;
	placeholderText?: string;
}

const FormInput: React.FC<TextInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
	label,
	id,
	name,
	type = 'text',
	step,
	required,
	wrapperClass,
	value,
	dateFormat = 'dd/MM/yyyy',
	showTimeSelect = false,
	timeFormat = 'HH:mm',
	...props
}) => {
	if (type === 'date' || type === 'datetime') {
		const [field, meta, helpers] = useField({ name });
		const {
			theme: { input },
		}: any = useContext(ThemeContext)

		const baseStyle = input.base

		const cls = classNames(baseStyle, props.className, 'block w-full')

		return (
			<div className={classNames(wrapperClass, '')}>
				<Label htmlFor={id || name}>
					{label} {required && <span className='text-red-500'>*</span>}
				</Label>
				<DatePicker
					id={id || name}
					selected={field.value ? new Date(field.value) : null}
					onChange={((date) => helpers.setValue(date)) as any}
					onBlur={field.onBlur}
					dateFormat={type === 'datetime' ? `${dateFormat} ${timeFormat}` : dateFormat}
					showTimeSelect={type === 'datetime' || showTimeSelect}
					timeFormat={timeFormat}
					{...props as any}
					className={cls} />
				{meta.touched && meta.error ? (
					<HelperText valid={false}>
						{meta.error}
					</HelperText>
				) : null}
			</div>
		);
	}

	if (type === 'file') {
		const [field, meta, helpers] = useField({ name });
		const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.currentTarget.files;
			if (files && files.length > 0) {
				helpers.setValue(files[0]);
			}
		};
		return (
			<div>
				<Label htmlFor={id || name}>
					{label} {required && <span className='text-red-500'>*</span>}
				</Label>
				<Input
					id={id || name}
					name={name}
					type={type}
					onChange={handleFileChange}
					onBlur={field.onBlur}
					{...props}
				/>
				{meta.touched && meta.error ? (
					<HelperText valid={false}>
						{meta.error}
					</HelperText>
				) : null}
			</div>
		);
	}

	if (type === 'checkbox') {
		const [field, meta, helpers] = useField({
			name,
			type: 'checkbox'
		});
		return (
			<div className={classNames(wrapperClass, '')}>
				<div className="flex items-center">
					<Input
						{...props}
						id={id || name}
						type="checkbox"
						checked={field.value === 1 || field.value === true || field.value === "1"}
						onChange={(e) => {
							helpers.setValue(e.target.checked ? 1 : 0);
						}}
					/>
					<Label className="ml-2" htmlFor={id || name}>
						{label} {required && <span className='text-red-500'>*</span>}
					</Label>
				</div>
				{meta.touched && meta.error ? (
					<HelperText valid={false}>{meta.error}</HelperText>
				) : null}
			</div>
		);
	}

	if (type === 'radio') {
		const [field, helpers] = useField({
			name,
			type: 'radio',
			value
		});
		return (
			<input
				{...props}
				type="radio"
				id={id || `${name}`}
				name={name}
				value={value}
				checked={field.value === value}
				onChange={() => {
					(helpers as any).setValue(value);
				}}
				onBlur={field.onBlur}
			/>
		);
	}

	const [field, meta] = useField({ ...props, name });
	return (
		<div className={classNames(wrapperClass, '')}>
			<Label htmlFor={id || name}>
				{label} {required && <span className='text-red-500'>*</span>}
			</Label>
			<Input
				{...field}
				{...props}
				type={type}
				step={step as string}
				id={id || name}
			/>
			{meta.touched && meta.error ? (
				<HelperText valid={false}>
					{meta.error}
				</HelperText>
			) : null}
		</div>
	);
};

export default FormInput;