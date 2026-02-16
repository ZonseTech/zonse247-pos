import { FunctionComponent } from 'react';
import { useFormikContext } from 'formik';
import { FormSwitch, FormFieldCard, FormSearchableSelect } from '../../components';

const GeneralSettingsPage: FunctionComponent = () => {
    const { values } = useFormikContext<{ enableVirtualKeyboard: boolean }>();

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

    const dateFormatOptions = [
        { label: 'DD/MM/YYYY (15/12/2025)', value: 'DD/MM/YYYY' },
        { label: 'MM/DD/YYYY (12/15/2025)', value: 'MM/DD/YYYY' },
        { label: 'YYYY-MM-DD (2025-12-15)', value: 'YYYY-MM-DD' },
        { label: 'DD-MM-YYYY (15-12-2025)', value: 'DD-MM-YYYY' },
        { label: 'DD.MM.YYYY (15.12.2025)', value: 'DD.MM.YYYY' }
    ];

    const productDisplayModeOptions = [
        { label: 'Grid View', value: 'GRID' },
        { label: 'List View', value: 'LIST' },
        { label: 'Compact View', value: 'COMPACT' }
    ];

    const barcodeScanModeOptions = [
        { label: 'Auto', value: 'AUTO' },
        { label: 'Manual', value: 'MANUAL' },
        { label: 'Camera', value: 'CAMERA' }
    ];

    return (
        <div className="rounded-none">
            <div className="space-y-6">
                <FormFieldCard>
                    <FormSearchableSelect
                        label="Date Format"
                        name="dateFormat"
                        options={dateFormatOptions}
                        required
                        placeholder="Select date format..."
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <FormSearchableSelect
                        label="Barcode Scan Mode"
                        name="barcodeScanMode"
                        options={barcodeScanModeOptions}
                        placeholder="Select scan mode..."
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormSwitch
                                name="showProductImages"
                                label="Show Product Images"
                                description="Display product images in lists"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSearchableSelect
                                label="Product Display Mode"
                                name="productDisplayMode"
                                options={productDisplayModeOptions}
                                placeholder="Select display mode..."
                            />
                        </div>
                    </div>
                </FormFieldCard>

                <FormFieldCard >
                    <FormSwitch
                        name="enableStockAlerts"
                        label="Enable Stock Alerts"
                        description="Get notified when stock is low"
                    />
                </FormFieldCard>

                <FormFieldCard title="Virtual Keyboard">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <FormSwitch
                                name="enableVirtualKeyboard"
                                label="Enable Virtual Keyboard"
                                description="Show on-screen keyboard for touch input"
                            />
                        </div>

                        {values.enableVirtualKeyboard && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormSearchableSelect
                                        label="Keyboard Layout"
                                        name="virtualKeyboardLayout"
                                        options={virtualKeyboardLayoutOptions}
                                        placeholder="Select layout..."
                                    />

                                    <FormSearchableSelect
                                        label="Keyboard Theme"
                                        name="virtualKeyboardTheme"
                                        options={virtualKeyboardThemeOptions}
                                        placeholder="Select theme..."
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <FormSwitch
                                        name="virtualKeyboardSound"
                                        label="Keyboard Sound"
                                        description="Play sound when keys are pressed"
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <FormSwitch
                                        name="virtualKeyboardHaptic"
                                        label="Haptic Feedback"
                                        description="Vibrate when keys are pressed (mobile only)"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </FormFieldCard>
            </div>
        </div>
    );
};

export default GeneralSettingsPage;
