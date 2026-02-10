import { FunctionComponent } from 'react';
import { User2Icon } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';
import { useIsMobile } from '../../hooks/useMediaQuery';
import PageHeader from '../../components/page/PageHeader';
import MobileMyProfile from './MobileMyProfile';
import {
    ProfileOverviewCard,
    AccountDetailsCard,
    ActivityCard,
    AppearanceCard,
    LogoutCard,
    EditProfileForm,
    ChangePasswordForm,
    PermissionsCard,
} from './profile';

const MyProfilePage: FunctionComponent = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();

    // Render mobile view
    if (isMobile) {
        return <MobileMyProfile />;
    }

    // Desktop view
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader
                title="My Profile"
                description="Manage your account settings and preferences"
                icon={<User2Icon className="w-8 h-8 text-sky-500" />}
            />

            <ProfileOverviewCard user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <AccountDetailsCard user={user} />
                    <ActivityCard user={user} />
                    <LogoutCard />
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