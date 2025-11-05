// Image Preview Component
export const ImagePreview = ({ files }) => {
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (!files || files.length === 0) {
            setPreviews([]);
            return;
        }

        const newPreviews = [];
        Array.from(files).forEach((file) => {
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviews.push(e.target.result);
                    if (newPreviews.length === files.length) {
                        setPreviews([...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }, [files]);

    if (previews.length === 0) return null;

    return (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
            {previews.map((preview, index) => (
                <div key={index} className="relative group">
                    <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    />
                </div>
            ))}
        </div>
    );
};