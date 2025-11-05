// Towing Details Component
export const TowingDetails = ({ showTowing, formData, handleInputChange, errors }) => {
    if (!showTowing) return null;

    return (
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Towing Details</h3>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="pickupAddress" className="dark:text-gray-200">Pickup Location</Label>
                        <Input
                            id="pickupAddress"
                            name="pickupAddress"
                            value={formData.pickupAddress}
                            onChange={handleInputChange}
                            placeholder="Enter pickup address"
                            className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Default is your current location.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="dropoffAddress" className="dark:text-gray-200">
                            Dropoff Location
                        </Label>
                        <Input
                            id="dropoffAddress"
                            name="dropoffAddress"
                            value={formData.dropoffAddress}
                            onChange={handleInputChange}
                            placeholder="Enter dropoff address"
                            className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Where should your bike be towed to?
                        </p>
                        {errors.dropoff && (
                            <p className="text-sm text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.dropoff}
                            </p>
                        )}
                    </div>

                    <MapComponent id="towing-map" height={200} />
                </div>
            </CardContent>
        </Card>
    );
};
