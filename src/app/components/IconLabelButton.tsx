import { Fragment, isValidElement } from 'react';
import type { FunctionComponent, MouseEvent, ReactNode } from 'react';
import classNames from 'classnames';

type IconLabelButtonProps = {
    color?: string;
    iconColor?: string;
    text: string | undefined | null;
    icon?: ReactNode;
    fullWidth?: boolean;
    onClick?: ((e: MouseEvent<HTMLAnchorElement>) => void) | ReactNode;
};

const IconLabelButton: FunctionComponent<IconLabelButtonProps> = ({
    color = 'bg-cyan-400',
    iconColor = 'bg-cyan-400',
    text,
    icon,
    fullWidth = false,
    onClick,
}) => {

    const handleOnClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (typeof onClick === 'function') {
            onClick(e);
        }
    }

    return (<div
        className={classNames('flex items-stretch overflow-hidden rounded', {
            'w-full': fullWidth,
        })}
    >
        {
            isValidElement(onClick) ? onClick : <Fragment>
                <div
                    className={classNames('flex items-stretch overflow-hidden rounded', {
                        'w-full': fullWidth,
                    })}
                >
                    <a
                        href="#"
                        onClick={handleOnClick}
                        className={classNames(
                            `text-white p-2 flex items-center`,
                            `${iconColor}`
                        )}
                    >
                        {icon}
                    </a>

                    <a
                        href="#"
                        onClick={handleOnClick}
                        className={classNames(
                            `text-white p-2 flex items-center truncate`,
                            `${color}`,
                            {
                                'flex-1': fullWidth,
                            }
                        )}
                    >
                        {text}
                    </a>
                </div>
            </Fragment>
        }
    </div>)
}

export default IconLabelButton;
