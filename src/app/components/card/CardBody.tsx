import React, { useContext } from 'react'
import classNames from 'classnames'
import { ThemeContext } from '../../context/ThemeContext'

const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function CardBody(props, ref) {
	const { className, children, ...other } = props
	const {
		theme: { cardBody },
	}: any = useContext(ThemeContext)

	const baseStyle = cardBody.base

	const cls = classNames(baseStyle, className)

	return (
		<div className={cls} ref={ref} {...other}>
			{children}
		</div>
	)
})

export default CardBody