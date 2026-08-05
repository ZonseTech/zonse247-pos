import { Callout } from '@radix-ui/themes';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }: { message: string }) => (
    <Callout.Root color="red" role="alert" size="2">
        <Callout.Icon>
            <AlertCircle className="w-4 h-4" />
        </Callout.Icon>
        <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
);

export default ErrorAlert