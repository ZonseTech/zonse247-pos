import React, { type PropsWithChildren } from 'react'
import classNames from 'classnames'

type Props = {
	bgColorClass: string
	className: string
	iconColorClass: string
	iconClassName?: string
	icon: React.ElementType
}

const RoundIcon: React.FC<PropsWithChildren<Props>> = ({
	iconColorClass = 'text-purple-600',
	bgColorClass = 'bg-purple-100',
	className,
	icon: Icon,
	iconClassName = 'w-5 h-5'
}) => {

	const baseStyle = 'p-3 rounded-full'
	const cls: string = classNames(baseStyle, iconColorClass, bgColorClass, className)

	return (
		<div className={cls}>
			<Icon className={iconClassName} />
		</div>
	)
}

export default RoundIcon
