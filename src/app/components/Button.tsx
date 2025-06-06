import classNames from 'classnames'
import React, { Fragment, type ReactNode, useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import warn from '../utils/warning'

export type IconType =
	| string
	| React.FunctionComponent<{ className: string; 'aria-hidden': boolean }>
	| React.ComponentClass<{ className: string; 'aria-hidden': boolean }>

export interface Props {
	children?: React.ReactNode
	/**
	 * Defines if the button is disabled
	 */
	disabled?: boolean
	/**
	 * The size of the button
	 */
	size?: 'larger' | 'large' | 'regular' | 'small' | 'pagination'
	/**
	 * Shows only one icon inside the button; defaults to left
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
	 * The style of the button
	 */
	layout?: 'outline' | 'link' | 'primary' | '__dropdownItem'
	/**
	 * Shows the button as a block (full width)
	 */
	block?: boolean
	/**
	 * Action indicator
	 */
	loading?: boolean
	/**
	 * The type of the button
	 */
	theme?: 'success' | 'danger' | 'warning' | 'neutral' | 'primary'
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

	function hasIcon() {
		return !!icon || !!iconLeft || !!iconRight
	}

	warn(
		hasIcon() && !other['aria-label'] && !children,
		'Button',
		'You are using an icon button, but no "aria-label" attribute was found. Add an "aria-label" attribute to work as a label for screen readers.'
	)

	const IconLeft = iconLeft || icon
	const IconRight = iconRight

	const baseStyle = button.base
	const blockStyle = button.block
	const sizeStyles = {
		larger: button.size.larger,
		large: button.size.large,
		regular: button.size.regular,
		small: button.size.small,
		pagination: button.size.pagination,
	}
	const iconSizeStyles = {
		larger: button.size.icon.larger,
		large: button.size.icon.large,
		regular: button.size.icon.regular,
		small: button.size.icon.small,
		pagination: button.size.icon.regular,
	}
	const iconStyle = button.icon[size]
	const layoutStyles = {
		primary: button.primary.base,
		outline: button.outline.base,
		link: button.link.base,
	}
	const activeStyles = {
		primary: button.primary.active,
		outline: button.outline.active,
		link: button.link.active,
	}
	const disabledStyles = {
		primary: button.primary.disabled,
		outline: button.outline.disabled,
		link: button.link.disabled,
	}

	const dropdownItemStyle = button.dropdownItem.base

	const themeStyle = {
		success: button.theme.success,
		danger: button.theme.danger,
		warning: button.theme.warning,
		neutral: button.theme.neutral,
		primary: button.theme.primary,
	}

	const buttonStyles =
		layout === '__dropdownItem'
			? classNames(dropdownItemStyle, className)
			: classNames(
				baseStyle,
				hasIcon() && !children && iconSizeStyles[size],
				hasIcon() && children && sizeStyles[size],
				!hasIcon() && sizeStyles[size],
				layoutStyles[layout],
				disabled ? disabledStyles[layout] : activeStyles[layout],
				block ? blockStyle : null,
				className,
				theme ? themeStyle[theme] : null,
			)

	const iconLeftStyles = classNames(iconStyle, children ? button.icon.left : '')
	const iconRightStyles = classNames(iconStyle, children ? button.icon.right : '')

	const LoadingIndicator = () => (
		<div className="flex items-center justify-center">
			<span>Loading...</span>
		</div>
	);

	const renderContent = () => {
		return (
			<Fragment>
				{IconLeft && (
					<IconLeft className={iconLeftStyles} aria-hidden={true} />
				)}
				{loading ? <LoadingIndicator /> : children}
				{IconRight && (
					<IconRight className={iconRightStyles} aria-hidden={true} />
				)}
			</Fragment>
		);
	};
	return React.createElement(
		tag,
		{
			className: buttonStyles,
			ref,
			disabled: loading || disabled,
			type,
			...other,
		},
		renderContent()
	);
})

export default Button