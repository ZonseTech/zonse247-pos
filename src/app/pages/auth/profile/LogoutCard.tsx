import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/card/Card';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthProvider';
import { ROUTES } from '../../../utils/constants';
import Button from '../../../components/Button';

const LogoutCard: FunctionComponent = () => {
    const navigate = useNavigate();
    const { signout } = useAuth();

    const handleLogout = () => {
        signout(() => navigate(ROUTES.LOGIN));
    };

    return (
        <Card className="p-6 border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-2 mb-4">
                <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sign Out
                </h3>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        End Your Session
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        You'll be redirected to the login page
                    </p>
                </div>
                <Button
                    theme="danger"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </Button>
            </div>
        </Card>
    );
};

export default LogoutCard;
