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
    return (
        <button
            onClick={onClick}
            className={`
        ${bgColor} 
        p-6 
        text-white dark:text-gray-100 
        rounded-xl 
        h-24 
        shadow-lg hover:shadow-xl dark:shadow-2xl dark:hover:shadow-3xl
        border border-white/10 dark:border-gray-700/50
        backdrop-blur-sm
        bg-gradient-to-br from-white/5 to-transparent
        dark:from-white/5 dark:to-black/20
        ${onClick === undefined
                    ? "cursor-none pointer-events-none opacity-90"
                    : `
            transition-all duration-300 ease-out
            hover:scale-105 active:scale-95
            hover:-translate-y-1
            focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 
            dark:focus:ring-gray-400/30 dark:focus:ring-offset-gray-900
            relative overflow-hidden
            before:absolute before:inset-0 before:bg-gradient-to-r 
            before:from-transparent before:via-white/10 before:to-transparent 
            before:translate-x-[-100%] hover:before:translate-x-[100%] 
            before:transition-transform before:duration-1000 before:ease-out
          `
                }
      `}
        >
            {icon ? (
                <Fragment>
                    <div className="flex">
                        <div className={`
              flex items-center justify-center 
              p-3 
              rounded-xl 
              ${color}
              shadow-lg dark:shadow-xl
              border border-white/20 dark:border-gray-600/30
              backdrop-blur-sm
              transition-all duration-300
              group-hover:scale-110
            `}>
                            <span className="
                text-white dark:text-gray-100 
                text-3xl 
                drop-shadow-lg
                transition-transform duration-300 
                group-hover:rotate-12
              ">
                                {icon}
                            </span>
                        </div>
                        <div className="ml-5 text-left flex-1">
                            <p className="
                text-sm font-medium 
                text-gray-200 dark:text-gray-300
                opacity-90 
                transition-all duration-200
                group-hover:opacity-100
                mb-1
              ">
                                {label}
                            </p>
                            <div className="flex items-baseline">
                                <p className="
                  text-2xl font-bold 
                  text-gray-100 dark:text-white
                  drop-shadow-sm
                  transition-all duration-200
                  group-hover:text-white dark:group-hover:text-gray-50
                ">
                                    {value}
                                </p>
                            </div>
                        </div>
                    </div>
                </Fragment>
            ) : (
                <div className="
          flex flex-col items-center justify-center 
          h-full
          transition-all duration-300
        ">
                    <p className="
            text-sm font-semibold 
            mb-2 
            opacity-90 
            transition-opacity duration-200
            group-hover:opacity-100
          ">
                        {label}
                    </p>
                    <p className="
            text-3xl font-bold 
            drop-shadow-lg
            transition-all duration-200
            group-hover:scale-110
          ">
                        {value}
                    </p>
                </div>
            )}

            <div className="
        absolute inset-0 
        bg-gradient-to-br from-white/0 via-white/5 to-white/0
        dark:from-white/0 dark:via-white/3 dark:to-black/10
        opacity-0 transition-opacity duration-300
        hover:opacity-100
        pointer-events-none
        rounded-xl
      " />
        </button>
    );
};

export default StatCard;