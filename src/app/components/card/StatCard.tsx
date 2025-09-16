import { Fragment, type FunctionComponent } from "react";

interface Props {
    label: string;
    value: string;
    color?: string;
    bgColor?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

const StatCard: FunctionComponent<Props> = ({ label, value, icon, color, bgColor, onClick }) => {
    const isClickable = onClick !== undefined;

    return (
        <div
            onClick={onClick}
            className={`
                group relative
                ${bgColor || 'bg-gradient-to-br from-slate-600 to-slate-700'} 
                p-6 
                text-white
                rounded-lg 
                h-32
                border border-white/10
                backdrop-blur-sm
                bg-opacity-90
                overflow-hidden
                ${isClickable
                    ? `
                        cursor-pointer
                        transition-all duration-300 ease-out
                        hover:scale-[1.02] active:scale-[0.98]
                        hover:-translate-y-1
                        focus:outline-none focus:ring-4 focus:ring-white/20
                        focus:ring-offset-2 focus:ring-offset-transparent
                    `
                    : "cursor-default"
                }
            `}
        >
            <div className="
                absolute inset-0 
                bg-gradient-to-br from-white/10 via-transparent to-black/10
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                pointer-events-none
                rounded-lg
            " />

            {isClickable && (
                <div className="
                    absolute inset-0 
                    bg-gradient-to-r from-transparent via-white/15 to-transparent
                    translate-x-[-100%] group-hover:translate-x-[100%]
                    transition-transform duration-1000 ease-out
                    pointer-events-none
                " />
            )}

            <div className="
                absolute inset-[1px]
                rounded-lg
                bg-gradient-to-b from-white/5 to-transparent
                pointer-events-none
            " />

            {icon ? (
                <Fragment>
                    <div className="flex items-start h-full">
                        <div className={`
                            flex items-center justify-center 
                            p-3 
                            rounded-xl 
                            ${color || 'bg-white/20'}
                            border border-white/30
                            backdrop-blur-sm
                            transition-all duration-300
                            group-hover:scale-110 group-hover:rotate-3
                            group-hover:shadow-xl
                            flex-shrink-0
                        `}>
                            <span className="
                                text-white 
                                text-lg 
                                drop-shadow-lg
                                transition-all duration-300 
                                group-hover:scale-110
                            ">
                                {icon}
                            </span>
                        </div>

                        <div className="ml-4 text-left flex-1 flex flex-col justify-center h-full">
                            <p className="
                                text-xs font-semibold uppercase tracking-wider
                                text-white/80
                                opacity-90 
                                transition-all duration-200
                                group-hover:opacity-100
                                mb-2
                                leading-tight
                            ">
                                {label}
                            </p>
                            <p className="
                                text-lg font-bold 
                                text-white
                                transition-all duration-200
                                group-hover:scale-105
                                leading-none
                            ">
                                {value}
                            </p>
                        </div>
                    </div>
                </Fragment>
            ) : (
                <div className="
                    flex flex-col items-center justify-center 
                    h-full
                    transition-all duration-300
                    group-hover:scale-105
                ">
                    <p className="
                        text-xs font-semibold uppercase tracking-wider
                        text-white/80
                        mb-3
                        opacity-90 
                        transition-opacity duration-200
                        group-hover:opacity-100
                        text-center
                    ">
                        {label}
                    </p>
                    <p className="
                        text-3xl font-bold 
                        text-white
                        drop-shadow-lg
                        transition-all duration-200
                        group-hover:scale-110
                        text-center
                        leading-none
                    ">
                        {value}
                    </p>
                </div>
            )}

            {isClickable && (
                <div className="
                    absolute bottom-2 right-2
                    w-2 h-2
                    bg-white/30
                    rounded-full
                    transition-all duration-300
                    group-hover:bg-white/50
                    group-hover:scale-125
                " />
            )}

            <div className="
                absolute -inset-1
                bg-gradient-to-r from-white/0 via-white/10 to-white/0
                rounded-lg
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                pointer-events-none
                blur-sm
            " />
        </div>
    );
};

export default StatCard;