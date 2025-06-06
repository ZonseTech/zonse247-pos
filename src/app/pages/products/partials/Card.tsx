import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    bgColor: string;
    onClick: () => void
}

const Card: React.FC<CardProps> = ({ title, value, bgColor, onClick }) => {
    return (
        <button onClick={onClick} className={`${bgColor} p-6 rounded-md flex flex-col items-center justify-center h-24`}>
            <div className="text-white text-sm font-medium mb-2">{title}</div>
            <div className="text-white text-3xl font-bold">{value}</div>
        </button>
    );
};

export default Card;