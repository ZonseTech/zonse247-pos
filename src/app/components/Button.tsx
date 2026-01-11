import classNames from 'classnames'
import React, { Fragment, type ReactNode, useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import warn from '../utils/warning'

export type IconType =
	| string
	| React.FunctionComponent<{ className: string; 'aria-hidden': boolean }>
	| React.ComponentClass<{ className: string; 'aria-hidden': boolean }>

/**
 * Button size options matching theme config
 */
export type ButtonSize = 'larger' | 'large' | 'regular' | 'small' | 'pagination'

/**
 * Button layout/variant options matching theme config
 */
export type ButtonLayout = 'primary' | 'outline' | 'link' | '__dropdownItem'

/**
 * Button color theme options matching theme config
 */
export type ButtonTheme = 'primary' | 'success' | 'danger' | 'warning' | 'neutral'

export interface Props {
	children?: React.ReactNode
	/**
	 * Defines if the button is disabled
	 */
	disabled?: boolean
	/**
	 * The size of the button
	 * @default 'regular'
	 */
	size?: ButtonSize
	/**
	 * Shows only one icon inside the button; defaults to left position
	 */
	icon?: IconType
	/**
	 * Shows an icon inside the button, left aligned
	 */
	iconLeft?: IconType
	/**
	 * Shows an icon inside the button, right aligned
	 */
	iconRight?: IconType
	/**
	 * The layout/variant style of the button
	 * @default 'primary'
	 */
	layout?: ButtonLayout
	/**
	 * Shows the button as a block (full width)
	 * @default false
	 */
	block?: boolean
	/**
	 * Shows loading indicator and disables the button
	 * @default false
	 */
	loading?: boolean
	/**
	 * The color theme of the button (only applies to primary layout)
	 * @default 'primary'
	 */
	theme?: ButtonTheme
}

export interface ButtonAsButtonProps extends Props, React.ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * The element that should be rendered as a button
	 */
	tag?: 'button'
	/**
	 * The native HTML button type
	 */
	type?: 'button' | 'submit' | 'reset'
}

export interface ButtonAsAnchorProps extends Props, React.AnchorHTMLAttributes<HTMLAnchorElement> {
	tag: 'a'
}

export interface ButtonAsOtherProps extends Props, React.AnchorHTMLAttributes<HTMLAnchorElement> {
	tag: string
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps | ButtonAsOtherProps

type Ref = ReactNode | HTMLElement | string

const Button = React.forwardRef<Ref, ButtonProps>(function Button(props, ref) {
	const {
		tag = 'button',
		type = tag === 'button' ? 'button' : undefined,
		loading = false,
		disabled = false,
		size = 'regular',
		layout = 'primary',
		theme = 'primary',
		block = false,
		icon,
		iconLeft,
		iconRight,
		className,
		children,
		...other
	} = props

	const {
		theme: { button },
	}: any = useContext(ThemeContext)

	const hasIcon = !!icon || !!iconLeft || !!iconRight
	const isIconOnly = hasIcon && !children
	const isDisabled = loading || disabled

	warn(
		isIconOnly && !other['aria-label'],
		'Button',
		'You are using an icon button, but no "aria-label" attribute was found. Add an "aria-label" attribute to work as a label for screen readers.'
	)

	const IconLeft = iconLeft || icon
	const IconRight = iconRight

	// Base styles
	const baseStyle = button.base
	const blockStyle = button.block

	// Size styles from theme config
	const sizeStyles: Record<ButtonSize, string> = {
		larger: button.size.larger,
		large: button.size.large,
		regular: button.size.regular,
		small: button.size.small,
		pagination: button.size.pagination,
	}

	// Icon-only button size styles from theme config
	const iconSizeStyles: Record<ButtonSize, string> = {
		larger: button.size.icon.larger,
		large: button.size.icon.large,
		regular: button.size.icon.regular,
		small: button.size.icon.small,
		pagination: button.size.icon.regular,
	}

	// Icon dimension styles from theme config
	const iconDimensionStyles: Record<ButtonSize, string> = {
		larger: button.icon.larger,
		large: button.icon.large,
		regular: button.icon.regular,
		small: button.icon.small,
		pagination: button.icon.regular,
	}

	// Layout styles from theme config
	const layoutStyles: Record<Exclude<ButtonLayout, '__dropdownItem'>, string> = {
		primary: button.primary.base,
		outline: button.outline.base,
		link: button.link.base,
	}

	// Active/hover styles from theme config
	const activeStyles: Record<Exclude<ButtonLayout, '__dropdownItem'>, string> = {
		primary: button.primary.active,
		outline: button.outline.active,
		link: button.link.active,
	}

	// Disabled styles from theme config
	const disabledStyles: Record<Exclude<ButtonLayout, '__dropdownItem'>, string> = {
		primary: button.primary.disabled,
		outline: button.outline.disabled,
		link: button.link.disabled,
	}

	// Theme color styles from theme config (applies to primary layout)
	const themeStyles: Record<ButtonTheme, string> = {
		primary: button.theme.primary,
		success: button.theme.success,
		danger: button.theme.danger,
		warning: button.theme.warning,
		neutral: button.theme.neutral,
	}

	// Dropdown item style
	const dropdownItemStyle = button.dropdownItem.base

	// Build button class names
	const buttonStyles =
		layout === '__dropdownItem'
			? classNames(dropdownItemStyle, className)
			: classNames(
				baseStyle,
				// Apply icon-only size or regular size
				isIconOnly ? iconSizeStyles[size] : sizeStyles[size],
				// Layout base styles
				layoutStyles[layout],
				// State styles (disabled or active)
				isDisabled ? disabledStyles[layout] : activeStyles[layout],
				// Block style for full width
				block && blockStyle,
				// Theme colors (only meaningful for primary layout)
				layout === 'primary' && theme && themeStyles[theme],
				// Custom className
				className,
			)

	// Icon styles with proper spacing
	const iconLeftStyles = classNames(
		iconDimensionStyles[size],
		children && button.icon.left
	)
	const iconRightStyles = classNames(
		iconDimensionStyles[size],
		children && button.icon.right
	)

	// Loading indicator component
	const LoadingIndicator = () => (
		<svg
			className={classNames('animate-spin', iconDimensionStyles[size], children && 'mr-2')}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	)

	const renderContent = () => (
		<Fragment>
			{loading && <LoadingIndicator />}
			{!loading && IconLeft && (
				<IconLeft className={iconLeftStyles} aria-hidden={true} />
			)}
			{children}
			{!loading && IconRight && (
				<IconRight className={iconRightStyles} aria-hidden={true} />
			)}
		</Fragment>
	)

	return React.createElement(
		tag,
		{
			className: buttonStyles,
			ref,
			disabled: isDisabled,
			type,
			...other,
		},
		renderContent()
	)
})

export default Button