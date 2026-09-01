import { FC } from "react";
import { useNavigate } from "react-router";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import MobilePageHeader from "../../components/page/MobilePageHeader";
import DayEndCloseStockCountTable from "./partials/DayEndCloseStockCountTable";
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

            <DayEndCloseStockCountTable />
        </AppLayout>
    );
};

export default DayEndCloseForm;
