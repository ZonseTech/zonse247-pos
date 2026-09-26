import { FC, useRef, useState } from 'react';
import { Badge, Box, Button, Code, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import { Check, Copy, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FormModal } from '../../../components';

interface TerminalActivationQrModalProps {
    terminal: Terminal | null;
    branchName?: string;
    onClose: () => void;
}

const QR_SIZE = 232;
/** Pixel multiplier for the downloaded PNG so it stays sharp when printed */
const DOWNLOAD_SCALE = 4;

const ACTIVATION_STEPS = [
    'Open the Zonse247 app on the device',
    'Choose Scan on the activation screen',
    'Point the camera at this code, or enter the code manually',
];

/**
 * Shows a terminal's activation code as a QR code for the mobile app's
 * "Activate this device" scanner, which reads the raw code as the QR payload.
 */
const TerminalActivationQrModal: FC<TerminalActivationQrModalProps> = ({ terminal, branchName, onClose }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [copied, setCopied] = useState(false);
    const code = terminal?.activationCode ?? '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Rasterise the on-screen SVG into a PNG for printing or sharing
    const handleDownload = () => {
        const svg = svgRef.current;
        if (!svg || !terminal) return;

        const markup = new XMLSerializer().serializeToString(svg);
        const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = QR_SIZE * DOWNLOAD_SCALE;
            canvas.height = QR_SIZE * DOWNLOAD_SCALE;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.imageSmoothingEnabled = false;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `activation-${terminal.terminalCode || terminal.terminalId}.png`;
                link.click();
            }
            URL.revokeObjectURL(svgUrl);
        };
        image.onerror = () => URL.revokeObjectURL(svgUrl);
        image.src = svgUrl;
    };

    return (
        <FormModal
            open={!!terminal && !!code}
            onOpenChange={(open) => !open && onClose()}
            title={`Activate ${terminal?.terminalLabel ?? 'terminal'}`}
            description="Scan this QR code with the Zonse247 mobile app to activate the terminal"
            icon={<QrCode className="w-5 h-5" />}
            size="sm"
            footer={
                <Flex gap="3" justify="end">
                    <Button type="button" variant="outline" color="gray" onClick={handleDownload}>
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                    <Button type="button" onClick={onClose}>
                        Done
                    </Button>
                </Flex>
            }
        >
            {/* Pinned to the modal width so a long code can't widen the column and push the QR out of view */}
            <Flex direction="column" align="center" gap="4" width="100%" style={{ minWidth: 0 }}>
                <Text size="2" color="gray" align="center">
                    {branchName ? `${branchName} · ` : ''}Code {terminal?.terminalCode}
                </Text>

                {/* Always dark-on-white so the code scans reliably in dark mode too */}
                <Box p="4" flexShrink="0" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-4)', border: '1px solid var(--gray-a5)' }}>
                    <QRCodeSVG
                        ref={svgRef}
                        value={code}
                        size={QR_SIZE}
                        level="M"
                        marginSize={2}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        title={`Activation QR code for ${terminal?.terminalLabel ?? 'terminal'}`}
                        style={{ display: 'block', width: QR_SIZE, height: QR_SIZE }}
                    />
                </Box>

                <Flex align="start" justify="center" gap="2" width="100%">
                    {/* Activation codes are long hex strings: wrap anywhere instead of overflowing */}
                    <Code size="2" variant="soft" color="amber" style={{ wordBreak: 'break-all', whiteSpace: 'normal', textAlign: 'center', minWidth: 0 }}>
                        {code}
                    </Code>
                    <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
                        <IconButton type="button" variant="ghost" color={copied ? 'green' : 'gray'} size="1" onClick={handleCopy} aria-label="Copy activation code">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </IconButton>
                    </Tooltip>
                </Flex>

                <Flex direction="column" gap="2" width="100%">
                    {ACTIVATION_STEPS.map((step, index) => (
                        <Flex key={step} align="center" gap="2">
                            <Badge variant="soft" radius="full">
                                {index + 1}
                            </Badge>
                            <Text size="2" color="gray">
                                {step}
                            </Text>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </FormModal>
    );
};

export default TerminalActivationQrModal;
