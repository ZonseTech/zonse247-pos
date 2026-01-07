import { FunctionComponent } from 'react';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { Field } from 'formik';

const DisplaySettings: FunctionComponent = () => {
    const themeOptions = [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto (System)', value: 'auto' }
    ];

    const fontSizeOptions = [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
    ];

    const navigationMenuOptions = [
        { label: 'Desktop Menu', value: 'desktop' },
        { label: 'Web Navigation Bar', value: 'web' }
    ];

    const timeFormatOptions = [
        { label: '12 Hour (AM/PM)', value: '12h' },
        { label: '24 Hour', value: '24h' }
    ];

    const numberSeparatorOptions = [
        { label: 'Comma (1,000.00)', value: 'comma' },
        { label: 'Period (1.000,00)', value: 'period' },
        { label: 'Space (1 000.00)', value: 'space' }
    ];

    const currencyPositionOptions = [
        { label: 'Before ($100)', value: 'before' },
        { label: 'After (100$)', value: 'after' }
    ];

    const virtualKeyboardLayoutOptions = [
        { label: 'QWERTY', value: 'qwerty' },
        { label: 'Numeric', value: 'numeric' },
        { label: 'Alphanumeric', value: 'alphanumeric' }
    ];

    const virtualKeyboardThemeOptions = [
        { label: 'Default', value: 'default' },
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' }
    ];

    const languageOptions = [
        { label: 'English (US)', value: 'en_US' },
        { label: 'English (UK)', value: 'en_GB' },
        { label: 'English (Malawi)', value: 'en_MW' },
        { label: 'Chichewa (Malawi)', value: 'ny_MW' },
        { label: 'Portuguese', value: 'pt_PT' },
        { label: 'French', value: 'fr_FR' },
        { label: 'Spanish', value: 'es_ES' }
    ];

    const timezoneOptions = [
        { label: 'Africa/Blantyre (CAT)', value: 'Africa/Blantyre' },
        { label: 'Africa/Johannesburg (SAST)', value: 'Africa/Johannesburg' },
        { label: 'Africa/Harare (CAT)', value: 'Africa/Harare' },
        { label: 'Africa/Lusaka (CAT)', value: 'Africa/Lusaka' },
        { label: 'Africa/Maputo (CAT)', value: 'Africa/Maputo' },
        { label: 'UTC', value: 'UTC' }
    ];

    const dateFormatOptions = [
        { label: 'DD/MM/YYYY (15/12/2025)', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY (12/15/2025)', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD (2025-12-15)', value: 'YYYY-MM-DD' },
        { label: 'DD-MM-YYYY (15-12-2025)', value: 'DD-MM-YYYY' },
        { label: 'DD.MM.YYYY (15.12.2025)', value: 'DD.MM.YYYY' }
    ];

    return (
        <div className="rounded-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Display & UI Settings
            </h2>

            <FormWrapper>
                {/* Appearance */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Appearance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelectBox
                            label="Theme"
                            name="theme"
                            options={themeOptions}
                            required
                        />

                        <FormSelectBox
                            label="Font Size"
                            name="fontSize"
                            options={fontSizeOptions}
                            required
                        />

                        <FormSelectBox
                            label="Navigation Menu Type"
                            name="navigationMenuType"
                            options={navigationMenuOptions}
                        />

                        <FormInput
                            type="number"
                            name="screenBrightness"
                            label="Screen Brightness (%)"
                            placeholder="80"
                            min="10"
                            max="100"
                        />

                        <FormInput
                            type="number"
                            name="screenTimeoutSeconds"
                            label="Screen Timeout (seconds)"
                            placeholder="60"
                            min="10"
                            max="300"
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Animations
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show smooth transitions and animations
                                </p>
                            </div>
                            <Field type="checkbox" name="enableAnimations" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Notifications
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show system notifications
                                </p>
                            </div>
                            <Field type="checkbox" name="enableNotifications" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Virtual Keyboard */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Virtual Keyboard
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Virtual Keyboard
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Show on-screen keyboard for touch input
                                </p>
                            </div>
                            <Field type="checkbox" name="enableVirtualKeyboard" className="w-5 h-5 rounded" />
                        </div>

                        <FormSelectBox
                            label="Keyboard Layout"
                            name="virtualKeyboardLayout"
                            options={virtualKeyboardLayoutOptions}
                        />

                        <FormSelectBox
                            label="Keyboard Theme"
                            name="virtualKeyboardTheme"
                            options={virtualKeyboardThemeOptions}
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Keyboard Sound
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Play sound when keys are pressed
                                </p>
                            </div>
                            <Field type="checkbox" name="virtualKeyboardSound" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Haptic Feedback
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Vibrate when keys are pressed (mobile only)
                                </p>
                            </div>
                            <Field type="checkbox" name="virtualKeyboardHaptic" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Localization */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Localization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelectBox
                            label="Language"
                            name="language"
                            options={languageOptions}
                            required
                        />

                        <FormSelectBox
                            label="Timezone"
                            name="timezone"
                            options={timezoneOptions}
                            required
                        />

                        <FormSelectBox
                            label="Date Format"
                            name="dateFormat"
                            options={dateFormatOptions}
                            required
                        />

                        <FormSelectBox
                            label="Time Format"
                            name="timeFormat"
                            options={timeFormatOptions}
                            required
                        />
                    </div>
                </div>

                {/* Currency Display */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Currency Display
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            type="number"
                            name="currencyDecimalPlaces"
                            label="Currency Decimal Places"
                            placeholder="2"
                            min="0"
                            max="4"
                        />

                        <FormSelectBox
                            label="Number Separator"
                            name="numberSeparator"
                            options={numberSeparatorOptions}
                            required
                        />

                        <FormSelectBox
                            label="Currency Symbol Position"
                            name="currencySymbolPosition"
                            options={currencyPositionOptions}
                            required
                        />

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Currency Symbol
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display currency symbol on prices
                                </p>
                            </div>
                            <Field type="checkbox" name="showCurrencySymbol" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>

                {/* Display Preferences */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Display Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Product Images
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display product images in lists
                                </p>
                            </div>
                            <Field type="checkbox" name="showProductImages" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Stock Levels
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display inventory quantities
                                </p>
                            </div>
                            <Field type="checkbox" name="showStockLevels" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Item Codes
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display product SKUs/codes
                                </p>
                            </div>
                            <Field type="checkbox" name="showItemCodes" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Cashier Name
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display cashier name on receipts
                                </p>
                            </div>
                            <Field type="checkbox" name="showCashierName" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Terminal ID
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display terminal identifier
                                </p>
                            </div>
                            <Field type="checkbox" name="showTerminalId" className="w-5 h-5 rounded" />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Show Tax Breakdown
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Display detailed tax information
                                </p>
                            </div>
                            <Field type="checkbox" name="showTaxBreakdown" className="w-5 h-5 rounded" />
                        </div>
                    </div>
                </div>
            </FormWrapper>
        </div>
    );
};

export default DisplaySettings;
