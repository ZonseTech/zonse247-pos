import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Card, Flex, Box, Text, Heading, Button } from '@radix-ui/themes';
import { useAuth } from '../../../context/AuthProvider';
import { ROUTES } from '../../../utils/constants';

const LogoutCard: FunctionComponent = () => {
    const navigate = useNavigate();
    const { signout } = useAuth();

    const handleLogout = () => {
        signout(() => navigate(ROUTES.LOGIN));
    };

    return (
        <Card size="3" className="border-red-200 dark:border-red-900/30">
            <Flex align="center" gap="2" mb="4">
                <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                <Heading as="h3" size="4" weight="bold">
                    Sign Out
                </Heading>
            </Flex>
            <Flex align="center" justify="between">
                <Box>
                    <Text as="p" size="2" weight="medium">
                        End Your Session
                    </Text>
                    <Text as="p" size="1" color="gray">
                        You'll be redirected to the login page
                    </Text>
                </Box>
                <Button
                    color="red"
                    variant="solid"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </Flex>
        </Card>
    );
};

export default LogoutCard;
