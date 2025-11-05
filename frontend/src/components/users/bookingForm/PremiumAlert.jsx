// Premium Alert Component
export const PremiumAlert = ({ isPremium, discount }) => {
    if (!isPremium) return null;

    return (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-300">Premium Benefits Active</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                You'll receive priority service, {discount}% discount, and real-time mechanic tracking!
            </AlertDescription>
        </Alert>
    );
};