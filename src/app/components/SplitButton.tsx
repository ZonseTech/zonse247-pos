import classNames from 'classnames';
import type { FunctionComponent, MouseEvent, ReactNode } from 'react'
import { Fragment, isValidElement } from 'react'
import { HiOutlinePlus } from 'react-icons/hi';

type SplitButtonProps = {
    color?: string;
    iconColor?: string;
    text: string;
    icon?: ReactNode;
    fullWidth?: boolean;
    onClick?: ((e: MouseEvent<HTMLAnchorElement>) => void) | ReactNode;
    plusAction?: (() => void) | ReactNode;
};

const SplitButton: FunctionComponent<SplitButtonProps> = ({
    color = 'bg-green-400',
    iconColor = 'bg-green-400',
    text,
    icon,
    fullWidth = false,
    onClick,
    plusAction
}) => {
    const handlePlusClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (typeof plusAction === 'function') {
            plusAction();
        }
    };

    const handleOnClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (typeof onClick === 'function') {
            onClick(e);
        }
    }

    return (
        <div className={`flex items-stretch overflow-hidden rounded ${fullWidth ? 'w-full' : ''}`}>
            {
                isValidElement(onClick) ? (
                    onClick
                ) : <Fragment>
                    <a
                        href="#"
                        onClick={handleOnClick}
                        className={classNames(
                            `text-white dark:text-gray-100 p-2 flex items-center`,
                            `${iconColor}`)
                        }
                    >
                        {icon}
                    </a>
                    <a
                        href="#"
                        onClick={handleOnClick}
                        className={`${color} text-white dark:text-gray-100 truncate p-2 flex items-center ${fullWidth ? 'flex-1' : ''}`}
                    >
                        {text}
                    </a>
                </Fragment>
            }

            {isValidElement(plusAction) ? (
                plusAction
            ) : (
                <a
                    href="#"
                    onClick={handlePlusClick}
                    className="bg-green-400 text-white dark:text-gray-100 p-2 flex items-center"
                >
                    <HiOutlinePlus className='w-5 h-5' />
                </a>
            )}
        </div>
    );
};

export default SplitButton