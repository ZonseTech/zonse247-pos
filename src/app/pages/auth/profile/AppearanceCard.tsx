import { FunctionComponent, useContext } from 'react';
import { PaletteIcon } from 'lucide-react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { Card, Flex, Box, Text, Heading, Button } from '@radix-ui/themes';
import { ThemeContext } from '../../../context/ThemeContext';

const AppearanceCard: FunctionComponent = () => {
    const { mode: theme, toggleMode } = useContext(ThemeContext);

    return (
        <Card size="3">
            <Flex align="center" gap="2" mb="4">
                <PaletteIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Heading as="h3" size="4" weight="bold">
                    Appearance
                </Heading>
            </Flex>
            <Flex align="center" justify="between">
                <Box>
                    <Text as="p" size="2" weight="medium">
                        Theme
                    </Text>
                    <Text as="p" size="1" color="gray" className="capitalize">
                        Currently: {theme}
                    </Text>
                </Box>
                <Button
                    variant="soft"
                    color="gray"
                    onClick={toggleMode}
                >
                    {theme === 'light' ? (
                        <>
                            <HiOutlineMoon className="w-5 h-5" />
                            Dark
                        </>
                    ) : (
                        <>
                            <HiOutlineSun className="w-5 h-5" />
                            Light
                        </>
                    )}
                </Button>
            </Flex>
        </Card>
    );
};

export default AppearanceCard;
