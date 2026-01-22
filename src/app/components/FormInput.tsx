import React, { ChangeEvent, useContext, useState } from 'react';
import { useField } from 'formik';
import Label from './Label';
import Input from './Input';
import HelperText from './HelperText';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ThemeContext } from '../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';

interface TextInputProps {
	label?: string;
	ref?: React.RefObject<HTMLInputElement>;
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
	inputRef?: React.RefObject<HTMLInputElement>
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
					wrapperClassName='min-w-full'
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

	const [field, meta, helpers] = useField({ ...props, name });
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;

		if (value.length > 0) {
			value = value.charAt(0).toUpperCase() + value.slice(1);
		}

		helpers.setValue(value);
	};

	const isPasswordType = type === 'password';
	const inputType = isPasswordType && showPassword ? 'text' : type;

	return (
		<div className={classNames(wrapperClass, '')}>
			<Label htmlFor={id || name}>
				{label} {required && <span className='text-red-500'>*</span>}
			</Label>
			<div className="relative">
				<Input
					{...field}
					// onChange={handleChange}
					{...props}
					type={inputType}
					step={step as string}
					id={id || name}
					className={isPasswordType ? 'pr-10' : props.className}
				/>
				{isPasswordType && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="h-5 w-5" />
						) : (
							<Eye className="h-5 w-5" />
						)}
					</button>
				)}
			</div>
			{meta.touched && meta.error ? (
				<HelperText valid={false}>
					{meta.error}
				</HelperText>
			) : null}
		</div>
	);
};

export default FormInput;