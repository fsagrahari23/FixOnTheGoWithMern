// Map Component
export const MapComponent = ({ id, height = 300 }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && !mapRef.current.querySelector('.map-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'map-placeholder w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg';
            placeholder.innerHTML = `
        <div class="text-center p-4">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Interactive map will display here</p>
        </div>
      `;
            mapRef.current.appendChild(placeholder);
        }
    }, []);

    return (
        <div
            ref={mapRef}
            id={id}
            style={{ height: `${height}px` }}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        />
    );
};