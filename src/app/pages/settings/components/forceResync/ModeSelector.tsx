import { FunctionComponent } from 'react';
import { Flex, RadioCards, Text } from '@radix-ui/themes';
import { RESYNC_MODES } from './constants';

interface ModeSelectorProps {
    mode: ForceResyncMode;
    bridgeAvailable: boolean;
    onChange: (mode: ForceResyncMode) => void;
}

const ModeSelector: FunctionComponent<ModeSelectorProps> = ({
    mode,
    bridgeAvailable,
    onChange,
}) => (
    <RadioCards.Root
        value={mode}
        onValueChange={(value) => onChange(value as ForceResyncMode)}
        columns="1"
        gap="2"
    >
        {RESYNC_MODES.map((m) => {
            const disabled = m.requiresBridge && !bridgeAvailable;
            const Icon = m.icon;
            return (
                <RadioCards.Item key={m.id} value={m.id} disabled={disabled}>
                    <Flex align="start" gap="3" width="100%">
                        <Icon className="text-[var(--accent-9)] mt-0.5" size={18} />
                        <Flex direction="column" gap="1" style={{ flex: 1 }}>
                            <Text size="2" weight="medium">
                                {m.label}
                            </Text>
                            <Text size="1" color="gray">
                                {m.description}
                                {disabled ? ' Not available in this build.' : ''}
                            </Text>
                        </Flex>
                    </Flex>
                </RadioCards.Item>
            );
        })}
    </RadioCards.Root>
);

export default ModeSelector;
