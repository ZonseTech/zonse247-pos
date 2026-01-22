import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    bgColor?: string;
    onClick?: () => void;
    active?: boolean;
    small?: boolean;
}

const Card: React.FC<CardProps> = ({ title, value, bgColor = 'bg-gray-300', onClick = () => { }, active = false, small = false }) => {
    return (
        <button
            onClick={onClick}
            className={`
                ${bgColor}
                ${small ? 'p-3 h-16' : 'p-6 h-28'}
                ${active ? 'ring-2 ring-sky-400' : ''}
                rounded-lg
                flex
                flex-col
                items-center
                justify-center
                w-full
                transition-all
                duration-200
                ease-in-out
                hover:shadow-lg
                transform
                cursor-pointer
                border border-white/10
                backdrop-blur-sm
                hover:brightness-110
                relative
                overflow-hidden
                group
            `}
        >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className={`text-white dark:text-gray-100 text-sm font-medium mb-1 tracking-wide uppercase opacity-90 ${small ? 'text-xs' : ''}`}>
                {title}
            </div>
            <div className={`${small ? 'text-xl' : 'text-3xl'} text-white dark:text-gray-100 font-bold tracking-tight`}>
                {value}
            </div>
        </button>
    );
};

export default Card;