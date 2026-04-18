import { FunctionComponent } from 'react';
import { Gift, Star, Users, Zap } from 'lucide-react';
import { Text, Flex, Card } from '@radix-ui/themes';

const guideItems = [
    { icon: Gift, title: 'Earn Points', desc: 'Customers earn points automatically on every purchase' },
    { icon: Star, title: 'Tier Rewards', desc: 'Higher tiers get multiplied points and discounts' },
    { icon: Users, title: 'Auto-Enroll', desc: 'Optionally enroll customers on their first purchase' },
    { icon: Zap, title: 'Redeem', desc: 'Customers redeem points as discounts at checkout' },
];

const OnboardingGuide: FunctionComponent = () => (
    <Card variant="surface" className="mb-6 !bg-sky-50 dark:!bg-sky-950/20 !border-sky-200 dark:!border-sky-800">
        <Text size="2" weight="bold" className="text-sky-800 dark:text-sky-300 mb-3 block">
            Set up a loyalty program for your branch
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {guideItems.map(({ icon: Icon, title, desc }) => (
                <Flex key={title} direction="column" align="center" className="text-center" gap="1">
                    <Icon className="w-5 h-5 text-sky-500" />
                    <Text size="1" weight="medium" className="text-gray-800 dark:text-gray-200">{title}</Text>
                    <Text size="1" color="gray">{desc}</Text>
                </Flex>
            ))}
        </div>
    </Card>
);

export default OnboardingGuide;
