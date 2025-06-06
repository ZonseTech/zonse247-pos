import type { MouseEvent, ReactNode } from "react";
import IconButton from "../../components/IconButton";
import SplitButton from "../../components/SplitButton";
import IconLabelButton from "../../components/IconLabelButton";

type NavItemType = 'button' | 'split' | 'spacer' | 'icon';

export type NavItem = {
    type: NavItemType;
    color?: string;
    iconColor?: string;
    text?: string;
    icon?: ReactNode;
    fullWidth?: boolean;
    textColor?: string;
    showOnMobile?: boolean;
    onClick?: ((e: MouseEvent<HTMLAnchorElement>) => void) | ReactNode;
    plusAction?: (() => void) | ReactNode;
};

const renderNavItem = (item: NavItem, isMobile = false): ReactNode => {
    switch (item.type) {
        case 'button':
            return (
                <IconLabelButton
                    key={item.text || Math.random().toString()}
                    color={item.color || 'bg-sky-500'}
                    iconColor={item.iconColor || 'bg-sky-500'}
                    text={item.text || ''}
                    icon={item.icon}
                    fullWidth={isMobile}
                    onClick={item.onClick}
                />
            );
        case 'split':
            return (
                <SplitButton
                    key={item.text}
                    color={item.color || 'gray-400'}
                    iconColor={item.iconColor || 'bg-sky-500'}
                    text={item.text || ''}
                    icon={item.icon}
                    fullWidth={isMobile}
                    onClick={item.onClick}
                    plusAction={item.plusAction}
                />
            );
        case 'icon':
            return (
                <IconButton
                    key={item.text || Math.random().toString()}
                    color={item.color || 'gray-400'}
                    icon={item.icon || null}
                    onClick={item.onClick}
                />
            );
        case 'spacer':
            return <div key={`spacer-${Math.random()}`} className={`${isMobile ? '' : 'flex-grow'}`} />;
        default:
            return null;
    }
};

export default renderNavItem