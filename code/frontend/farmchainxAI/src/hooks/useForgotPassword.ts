import { useState, useCallback } from 'react';
import { useFormik } from 'formik';
import {
    forgotPasswordOtpValidationSchema,
    forgotPasswordRequestValidationSchema,
    forgotPasswordResetValidationSchema,
} from '../utils/validation/authValidation';
import {
    forgotPasswordRequest,
    resendOtpRequest,
    resetPasswordRequest,
    verifyOtpRequest,
} from '../api/authApi';

export type ForgotPasswordStep = 1 | 2 | 3 | 4; // 4 is success

export const useForgotPassword = () => {
    const [step, setStep] = useState<ForgotPasswordStep>(1);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [registeredIdentifier, setRegisteredIdentifier] = useState<string>('');
    const [resetToken, setResetToken] = useState<string>('');

    // Step 1: Request OTP
    const requestOtpFormik = useFormik({
        initialValues: {
            identifier: '', // username, email, or mobile no
        },
        validationSchema: forgotPasswordRequestValidationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setApiError(null);
            setApiMessage(null);
            try {
                const identifier = values.identifier.trim();
                const response = await forgotPasswordRequest({ identifier });

                setRegisteredIdentifier(identifier);
                setApiMessage(response.message);
                setStep(2);
            } catch (error: unknown) {
                setApiError(error instanceof Error ? error.message : 'Failed to send OTP. Please check your details and try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    // Step 2: Verify OTP
    const verifyOtpFormik = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: forgotPasswordOtpValidationSchema,
        onSubmit: async (values) => {
            setApiError(null);
            setApiMessage(null);
            if (!registeredIdentifier) {
                setApiError('Please request an OTP before verification.');
                return;
            }

            setIsLoading(true);
            try {
                const response = await verifyOtpRequest({
                    identifier: registeredIdentifier,
                    otp: values.otp,
                });
                setResetToken(response.resetToken);
                setApiMessage(response.message);
                setStep(3);
            } catch (error: unknown) {
                setApiError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    // Resend OTP handler
    const handleResendOtp = useCallback(async () => {
        setApiError(null);
        setApiMessage(null);
        if (!registeredIdentifier) {
            setApiError('Please provide your identifier before requesting another OTP.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await resendOtpRequest({ identifier: registeredIdentifier });
            setApiMessage(response.message);
            verifyOtpFormik.resetForm();
        } catch (error: unknown) {
            setApiError(error instanceof Error ? error.message : 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    }, [registeredIdentifier, verifyOtpFormik]);

    // Step 3: Reset Password
    const resetPasswordFormik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: forgotPasswordResetValidationSchema,
        onSubmit: async (values) => {
            setApiError(null);
            setApiMessage(null);
            if (!resetToken) {
                setApiError('OTP verification has expired. Please verify OTP again.');
                return;
            }

            setIsLoading(true);
            try {
                const response = await resetPasswordRequest({
                    resetToken,
                    newPassword: values.newPassword,
                });
                setApiMessage(response.message);
                setStep(4);
            } catch (error: unknown) {
                setApiError(error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    const resetFlow = useCallback(() => {
        setStep(1);
        setApiError(null);
        setApiMessage(null);
        setRegisteredIdentifier('');
        setResetToken('');
        requestOtpFormik.resetForm();
        verifyOtpFormik.resetForm();
        resetPasswordFormik.resetForm();
    }, [requestOtpFormik, verifyOtpFormik, resetPasswordFormik]);

    return {
        step,
        apiError,
        apiMessage,
        isLoading,
        registeredIdentifier,
        requestOtpFormik,
        verifyOtpFormik,
        resetPasswordFormik,
        handleResendOtp,
        resetFlow,
        setStep, // Expose for manual navigation if needed (e.g., going back)
        setApiError,
    };
};
