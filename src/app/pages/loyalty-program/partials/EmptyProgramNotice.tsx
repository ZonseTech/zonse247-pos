import { FunctionComponent } from 'react';
import { Crown, Award, Star, ArrowRight } from 'lucide-react';
import { Text, Flex, Button, Card } from '@radix-ui/themes';
import { ComponentLoader } from '../../../components';

const contextConfig = {
    tiers: {
        icon: Crown,
        title: 'No tiers yet',
        description: 'Set up reward tiers like Bronze, Silver, and Gold to give loyal customers multiplied points and automatic discounts.',
        features: [
            'Points multiplier per tier (e.g. 2× for Gold)',
            'Automatic discount percentage',
            'Customers upgrade tiers as they earn',
        ],
    },
    members: {
        icon: Award,
        title: 'No members yet',
        description: 'Once your program is live, customers are enrolled automatically on their first purchase — or you can enroll them manually.',
        features: [
            'Auto-enroll on first purchase',
            'Track points, tiers & transactions',
            'Adjust points for promotions',
        ],
    },
} as const;

interface EmptyProgramNoticeProps {
    loading: boolean;
    context: 'tiers' | 'members';
    onGoToSetup: () => void;
}

const EmptyProgramNotice: FunctionComponent<EmptyProgramNoticeProps> = ({ loading, context, onGoToSetup }) => {
    if (loading) return <ComponentLoader loading />;

    const cfg = contextConfig[context];
    const Icon = cfg.icon;

    return (
        <Flex direction="column" align="center" justify="center" py="8" px="4" className="max-w-lg mx-auto text-center">
            {/* Animated icon ring */}
            <div className="relative mb-6">
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900/20 animate-ping opacity-20" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-violet-100 dark:from-sky-900/30 dark:to-violet-900/30 border-2 border-dashed border-sky-300 dark:border-sky-700 flex items-center justify-center">
                    <Icon className="w-9 h-9 text-sky-500 dark:text-sky-400" />
                </div>
            </div>

            <Text size="4" weight="bold" className="text-gray-800 dark:text-gray-100 mb-2">
                {cfg.title}
            </Text>
            <Text size="2" color="gray" className="mb-6 leading-relaxed">
                {cfg.description}
            </Text>

            {/* Feature checklist */}
            <Card className="w-full mb-6" variant="surface">
                <Flex direction="column" gap="2" className="text-left">
                    {cfg.features.map((f) => (
                        <Flex key={f} align="start" gap="2">
                            <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <Text size="2" color="gray">{f}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Card>

            {/* CTA */}
            <Button
                size="2"
                onClick={onGoToSetup}
                className="shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
                Set up your program
                <ArrowRight className="w-4 h-4" />
            </Button>
        </Flex>
    );
};

export default EmptyProgramNotice;
