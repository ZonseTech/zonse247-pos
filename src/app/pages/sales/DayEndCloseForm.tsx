import { FC } from "react";
import { useNavigate } from "react-router";
import { CalendarCheck2 } from "lucide-react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import MobilePageHeader from "../../components/page/MobilePageHeader";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { ROUTES } from "../../utils/constants";

const DayEndCloseForm: FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const handleBack = () => navigate(ROUTES.SALES);

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader title="Day-end Close" />
            ) : (
                <PageHeader
                    title="Day-end Close"
                    description="Post the day's gross sales as a single figure, then record the closing stock count."
                    showBackButton
                    onBack={handleBack}
                />
            )}

            <Box className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6">
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    gap="3"
                    className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg py-16 px-6 text-center"
                >
                    <CalendarCheck2 className="w-10 h-10 text-gray-400" />
                    <Text size="3" weight="medium" className="text-gray-700 dark:text-gray-200">
                        Day-end close form coming soon
                    </Text>
                    <Text size="2" color="gray" className="max-w-sm">
                        This will let you record and post the closing figures for the day.
                    </Text>
                    <Button variant="soft" color="gray" onClick={handleBack}>
                        Back to Sales
                    </Button>
                </Flex>
            </Box>
        </AppLayout>
    );
};

export default DayEndCloseForm;
