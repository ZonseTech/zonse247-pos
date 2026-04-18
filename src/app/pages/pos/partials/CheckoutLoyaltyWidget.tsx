import { FC, useCallback, useEffect, useState } from 'react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Notify } from 'notiflix';
import classNames from 'classnames';
import { Text, Flex, Badge, Button as RadixButton } from '@radix-ui/themes';
import loyaltyService from '../../../services/loyalty.service';

interface CheckoutLoyaltyWidgetProps {
    customerId: string;
    isDefault: boolean;
    total: number;
    compact?: boolean;
    onRedemptionChange: (discount: number, memberId: string | null, points: number) => void;
}

const CheckoutLoyaltyWidget: FC<CheckoutLoyaltyWidgetProps> = ({
    customerId,
    isDefault,
    total,
    compact,
    onRedemptionChange,
}) => {
    const [member, setMember] = useState<LoyaltyMember | null>(null);
    const [notEnrolled, setNotEnrolled] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [redeemPoints, setRedeemPoints] = useState('');
    const [preview, setPreview] = useState<RedeemPreviewResponse | null>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    useEffect(() => {
        if (isDefault || !customerId) {
            setMember(null);
            setNotEnrolled(false);
            return;
        }

        loyaltyService.getMemberByCustomerId(customerId)
            .then((data) => { setMember(data); setNotEnrolled(false); })
            .catch((err: any) => {
                if (err?.response?.status === 404) setNotEnrolled(true);
                setMember(null);
            });
    }, [customerId, isDefault]);

    // Clear redemption when member changes
    useEffect(() => {
        setRedeemPoints('');
        setPreview(null);
        onRedemptionChange(0, null, 0);
    }, [member]);

    const handlePreview = useCallback(async () => {
        const pts = parseInt(redeemPoints, 10);
        if (!member || !pts || pts <= 0) {
            setPreview(null);
            onRedemptionChange(0, null, 0);
            return;
        }

        setIsPreviewing(true);
        try {
            const result = await loyaltyService.previewRedeem(member.loyaltyMemberId, pts);
            setPreview(result);
            if (result.canRedeem) {
                onRedemptionChange(result.monetaryValue, member.loyaltyMemberId, pts);
            } else {
                onRedemptionChange(0, null, 0);
            }
        } catch (err: any) {
            setPreview(null);
            onRedemptionChange(0, null, 0);
            Notify.failure(err?.response?.data?.message || 'Failed to preview redemption');
        } finally {
            setIsPreviewing(false);
        }
    }, [member, redeemPoints, onRedemptionChange]);

    const handlePointsChange = (value: string) => {
        setRedeemPoints(value);
        if (!value || parseInt(value, 10) <= 0) {
            setPreview(null);
            onRedemptionChange(0, null, 0);
        }
    };

    const handlePointsBlur = () => {
        if (redeemPoints && parseInt(redeemPoints, 10) > 0) {
            handlePreview();
        }
    };

    const handlePointsKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handlePreview();
        }
    };

    if (isDefault || !customerId) return null;

    // Not enrolled — just show a small notice
    if (notEnrolled) {
        return (
            <Flex align="center" gap="2" className={classNames('text-gray-400', compact ? 'text-xs py-1' : 'text-sm py-2')}>
                <Award className="w-3.5 h-3.5" />
                <Text size="1" color="gray">Not a loyalty member</Text>
            </Flex>
        );
    }

    if (!member) return null;

    return (
        <div className={classNames(
            'border rounded-lg transition-colors',
            preview?.canRedeem
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                : 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20',
            compact ? 'p-2' : 'p-3'
        )}>
            {/* Header — always visible */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <Award className={classNames(
                        'text-sky-500',
                        compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
                    )} />
                    <Text size={compact ? '1' : '2'} weight="bold" className="text-sky-700 dark:text-sky-300">
                        {member.tier.name} · {member.availablePoints.toLocaleString()} pts
                    </Text>
                    {member.tier.discountPercentage > 0 && (
                        <Badge color="green" variant="soft" size="1">
                            {member.tier.discountPercentage}% off
                        </Badge>
                    )}
                </div>
                {expanded
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
            </button>

            {/* Expanded — redeem section */}
            {expanded && (
                <div className={classNames('mt-2 pt-2 border-t border-sky-200 dark:border-sky-800', compact ? 'space-y-1.5' : 'space-y-2')}>
                    <Text size="1" color="gray" className="block">
                        Redeem points (max: {member.availablePoints.toLocaleString()})
                    </Text>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={redeemPoints}
                            onChange={(e) => handlePointsChange(e.target.value)}
                            onBlur={handlePointsBlur}
                            onKeyDown={handlePointsKeyDown}
                            placeholder="0"
                            min={0}
                            max={member.availablePoints}
                            className={classNames(
                                'flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none focus:ring-2 focus:ring-sky-500/30 text-gray-800 dark:text-gray-200',
                                compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
                            )}
                        />
                        <RadixButton
                            size="1"
                            type="button"
                            onClick={handlePreview}
                            disabled={isPreviewing || !redeemPoints || parseInt(redeemPoints, 10) <= 0}
                        >
                            {isPreviewing ? '...' : 'Apply'}
                        </RadixButton>
                    </div>

                    {/* Preview result */}
                    {preview && (
                        <div className={classNames(
                            'rounded px-2 py-1.5',
                            preview.canRedeem
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                        )}>
                            {preview.canRedeem ? (
                                <Text size="1">
                                    <strong>{preview.points.toLocaleString()} pts</strong> = <strong>K{preview.monetaryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> discount
                                    <Text size="1" color="gray" className="ml-1">
                                        (balance after: {preview.balanceAfterRedeem.toLocaleString()})
                                    </Text>
                                </Text>
                            ) : (
                                <Text size="1">Cannot redeem — min {preview.minRedeemPoints} pts required, {preview.availablePoints} available</Text>
                            )}
                        </div>
                    )}

                    {/* Clear button */}
                    {preview?.canRedeem && (
                        <RadixButton
                            size="1"
                            variant="ghost"
                            color="red"
                            type="button"
                            onClick={() => {
                                setRedeemPoints('');
                                setPreview(null);
                                onRedemptionChange(0, null, 0);
                            }}
                        >
                            Clear redemption
                        </RadixButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default CheckoutLoyaltyWidget;
