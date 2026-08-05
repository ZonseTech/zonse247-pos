import * as Yup from 'yup';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FunctionComponent } from 'react';
import { Box, Button as RadixButton, Card, Callout, Flex, Heading, Separator, Spinner, Text } from '@radix-ui/themes';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface TerminalActivationStepProps {
    onSubmit: (values: { activationCode: string }) => Promise<void>;
    loading?: boolean;
}

const activationCodeSchema = Yup.object({
    activationCode: Yup.string()
        .required('Activation code is required')
        .min(32, 'Activation code is too short')
        .matches(/^[a-f0-9:]+$/i, 'Invalid activation code format'),
});

const TerminalActivationStep: FunctionComponent<TerminalActivationStepProps> = ({
    onSubmit,
    loading = false,
}) => {
    return (
        <Card size="2" className=" bg-[color:var(--color-panel)]">
            <Flex direction="column" gap="4">
                <Box className="text-center">
                    <Flex align="center" justify="center" gap="2" mb="2">
                        <Sparkles className="w-5 h-5 text-[#102f4f]" />
                        <Heading as="h2" size="4">
                            Activate your terminal
                        </Heading>
                    </Flex>
                    <Text size="2" color="gray">
                        Enter the activation code provided by your administrator to get started.
                    </Text>
                </Box>

                <Separator size="4" />

                <Formik
                    initialValues={{ activationCode: '' }}
                    validationSchema={activationCodeSchema}
                    onSubmit={onSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Flex direction="column" gap="3">
                                <label htmlFor="activationCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Activation code
                                </label>
                                <div className="rounded-none border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                                    <Field
                                        id="activationCode"
                                        name="activationCode"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="Enter activation code"
                                        className="w-full text-center border-0 bg-transparent font-mono uppercase tracking-[0.25em] outline-none"
                                    />
                                </div>
                                <ErrorMessage name="activationCode">
                                    {(message) => (
                                        <Text color="red" size="1">
                                            {message}
                                        </Text>
                                    )}
                                </ErrorMessage>

                                <RadixButton
                                    type="submit"
                                    size="3"
                                    className="w-full justify-center"
                                    disabled={isSubmitting || loading}
                                >
                                    {isSubmitting || loading ? (
                                        <Flex align="center" justify="center" gap="2">
                                            <Spinner size="1" />
                                            <span>Activating...</span>
                                        </Flex>
                                    ) : (
                                        <Flex align="center" justify="center" gap="2">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Activate terminal</span>
                                        </Flex>
                                    )}
                                </RadixButton>
                            </Flex>
                        </Form>
                    )}
                </Formik>

            </Flex>
        </Card>
    );
};

export default TerminalActivationStep;
