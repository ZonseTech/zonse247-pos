import classNames from 'classnames';
import type { FunctionComponent, MouseEvent, ReactNode } from 'react'
import { Fragment, isValidElement } from 'react'

type IconButtonProps = {
    color: string;
    icon: ReactNode;
    className?: string;
    onClick?: ((e: MouseEvent<HTMLAnchorElement>) => void) | ReactNode;
};

const IconButton: FunctionComponent<IconButtonProps> = ({ color, icon, onClick, className }) => {

    const handleOnClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (typeof onClick === 'function') {
            onClick(e);
        }
    }

    return (
        isValidElement(onClick) ? onClick : <Fragment>
            <a
                href="#"
                onClick={handleOnClick}
                className={classNames(
                    'text-[#102f4f] dark:text-gray-100 p-2.5 rounded flex items-center',
                    className,
                    color,
                )}
            >
                {icon}
            </a>
        </Fragment>
    )
}

export default IconButton