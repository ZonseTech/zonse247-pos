import React, { useContext } from 'react'
import classNames from 'classnames'
import { ThemeContext } from '../context/ThemeContext'

const Backdrop = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function Backdrop(props, ref) {
	const { className, ...other } = props
	const {
		theme: { backdrop },
	}: any = useContext(ThemeContext)

	const baseStyle = backdrop.base

	const cls = classNames(baseStyle, className)
	return <div className={cls} ref={ref} {...other}></div>
})

export default Backdrop