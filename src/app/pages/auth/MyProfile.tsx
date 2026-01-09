import { FunctionComponent } from 'react';
import { User2Icon } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import PageHeader from '../../components/page/PageHeader';
import {
    ProfileOverviewCard,
    AccountDetailsCard,
    ActivityCard,
    AppearanceCard,
    EditProfileForm,
    ChangePasswordForm,
    PermissionsCard,
} from './profile';

const MyProfilePage: FunctionComponent = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader
                title="My Profile"
                description="Manage your account settings and preferences"
                icon={<User2Icon className="w-8 h-8 text-blue-600" />}
            />

            <ProfileOverviewCard user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <AccountDetailsCard user={user} />
                    <ActivityCard user={user} />
                    <AppearanceCard />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <EditProfileForm user={user} />
                    <ChangePasswordForm userId={user?.userId || ''} />
                    <PermissionsCard permissions={user?.permissions} />
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;