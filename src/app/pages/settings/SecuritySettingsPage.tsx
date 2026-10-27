import { FunctionComponent } from 'react';
import FormInput from '../../components/FormInput';
import { FormSwitch, FormFieldCard } from '../../components';
import CloudBackupCard from './components/CloudBackupCard';

const SecuritySettingsPage: FunctionComponent = () => {
    return (
        <div className="rounded-none">
            <div className="space-y-3">
                <FormFieldCard >
                    <FormSwitch
                        name="autoSyncOnReconnect"
                        label="Auto sync on reconnect"
                        description="Automatically sync when connection restored"
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <FormSwitch
                        name="requirePinForVoid"
                        label="Require PIN for Void"
                        description="PIN required to void transactions"
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <FormSwitch
                        name="requirePinForReturn"
                        label="Require PIN for Return"
                        description="PIN required to process returns"
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <FormInput
                        type="url"
                        name="apiBaseUrl"
                        label="API Base URL"
                        placeholder="https://api.yourdomain.com"
                        required
                    />
                </FormFieldCard>

                <CloudBackupCard />
            </div>
        </div>
    );
};

export default SecuritySettingsPage;
