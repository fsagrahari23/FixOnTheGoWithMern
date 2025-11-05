
// Basic Alert Component
export const BasicAlert = ({ isPremium }) => {
    if (isPremium) return null;

    return (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Basic User Booking Limit</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
                Basic users are limited to 2 active bookings at a time.{' '}
                <a href="/user/premium" className="font-bold underline hover:text-blue-900 dark:hover:text-blue-200">
                    Upgrade to Premium
                </a>{' '}
                for unlimited bookings.
            </AlertDescription>
        </Alert>
    );
};