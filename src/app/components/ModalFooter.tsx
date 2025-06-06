import React, { useContext } from 'react'
import classNames from 'classnames'
import { ThemeContext } from '../context/ThemeContext'

const ModalFooter = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLDivElement>>(function ModalFooter(props, ref) {
    const { children, className, ...other } = props
    const {
        theme: { modalFooter },
    }: any = useContext(ThemeContext)

    const baseStyle = modalFooter.base

    const cls = classNames(baseStyle, className)

    return (
        <footer className={cls} ref={ref} {...other}>
            {children}
        </footer>
    )
})

export default ModalFooter