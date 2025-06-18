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
            className={`${bgColor} p-6 text-white dark:text-gray-100 rounded-sm h-24 shadow-sm ${onClick === undefined ? "cursor-none pointer-events-none" : 'transition-transform hover:scale-105'}`}
        >

            {
                icon ?
                    <Fragment>
                        <div className="flex">
                            <div className={`flex items-center justify-center p-3 rounded-md ${color}`}>
                                <span className="text-white dark:text-gray-100 text-3xl">{icon}</span>
                            </div>
                            <div className="ml-5 text-left">
                                <p className="text-sm font-medium text-gray-200">{label}</p>
                                <div className="flex items-baseline">
                                    <p className="text-2xl font-semibold text-gray-100">{value}</p>
                                </div>
                            </div>
                        </div>
                    </Fragment> :
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-semibold mb-2">{label}</p>
                        <p className="text-3xl font-bold">{value}</p>
                    </div>
            }

        </button>
    );
};

export default StatCard;