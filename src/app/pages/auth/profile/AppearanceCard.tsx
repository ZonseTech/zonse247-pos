import { FunctionComponent, useContext } from 'react';
import Card from '../../../components/card/Card';
import { PaletteIcon } from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { ThemeContext } from '../../../context/ThemeContext';

const AppearanceCard: FunctionComponent = () => {
    const { mode: theme, toggleMode } = useContext(ThemeContext);

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <PaletteIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Appearance
                </h3>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Theme
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        Currently: {theme}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={toggleMode}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {theme === 'light' ? (
                        <>
                            <HiOutlineMoon className="w-5 h-5" />
                            <span className="text-sm">Dark</span>
                        </>
                    ) : (
                        <>
                            <HiOutlineSun className="w-5 h-5" />
                            <span className="text-sm">Light</span>
                        </>
                    )}
                </button>
            </div>
        </Card>
    );
};

export default AppearanceCard;
