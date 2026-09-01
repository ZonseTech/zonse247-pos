import { FC, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@radix-ui/themes";
import { Wallet } from "lucide-react";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import MobilePageHeader from "../../components/page/MobilePageHeader";
import DayEndCloseStockCountTable from "./partials/DayEndCloseStockCountTable";
import BalanceCashModal from "./partials/BalanceCashModal";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { ROUTES } from "../../utils/constants";

const DayEndCloseForm: FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [isBalanceCashOpen, setIsBalanceCashOpen] = useState(false);

    const handleBack = () => navigate(ROUTES.SALES);

    const balanceCashButton = (
        <Button size="2" variant="soft" onClick={() => setIsBalanceCashOpen(true)}>
            <Wallet className="w-4 h-4" />
            Balance Cash
        </Button>
    );

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader title="Day-end Close" rightContent={balanceCashButton} />
            ) : (
                <PageHeader
                    title="Day-end Close"
                    description="Post the day's gross sales as a single figure, then record the closing stock count."
                    showBackButton
                    onBack={handleBack}
                    action={balanceCashButton}
                />
            )}

            <DayEndCloseStockCountTable onPostDayEndClose={() => setIsBalanceCashOpen(true)} />

            <BalanceCashModal
                isOpen={isBalanceCashOpen}
                onClose={() => setIsBalanceCashOpen(false)}
            />
        </AppLayout>
    );
};

export default DayEndCloseForm;
