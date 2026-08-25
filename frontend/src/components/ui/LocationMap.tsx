import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';

export interface LocationMapProps {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    locationStatus?: string | null;
    locationError?: string | null;
}

const RTL_TEXT_PLUGIN_URL = 'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js';
let rtlTextPluginRequested = false;

const containsArabic = (value?: string | null) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value ?? '');

const locationMessages = {
    processing: {
        en: {
            title: 'Preparing location',
            body: 'The address is being resolved in the background. The map will appear automatically once the coordinates are ready.',
        },
        ar: {
            title: 'جارٍ تجهيز الموقع',
            body: 'يتم الآن تحديد العنوان وإعداد الإحداثيات في الخلفية. سيظهر الموقع تلقائيًا بمجرد اكتمال المعالجة.',
        },
    },
    idle: {
        en: {
            title: 'Address published',
            body: 'The location will appear here once the admin publishes or updates the address.',
        },
        ar: {
            title: 'تم نشر العنوان',
            body: 'سيظهر الموقع هنا عندما يفعّل المدير العنوان أو يحدّثه.',
        },
    },
    error: {
        en: {
            title: 'Location lookup unavailable',
            body: 'The address was saved, but the map service could not resolve it from this environment. Try a more specific address or check again later.',
        },
        ar: {
            title: 'تعذّر تحديد الموقع',
            body: 'تم حفظ العنوان، لكن خدمة الخريطة لم تتمكن من تحديده من هذه البيئة. جرّب عنوانًا أكثر تحديدًا أو أعد المحاولة لاحقًا.',
        },
    },
} as const;

const mapCardBaseStyle = {
    position: 'relative' as const,
    width: '100%',
    height: 'clamp(460px, 56vw, 620px)',
    borderRadius: '20px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
    marginTop: '48px',
    marginBottom: '16px',
    background: 'linear-gradient(180deg, rgba(7,16,30,0.98), rgba(10,22,40,0.92))',
};

const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ensureRtlTextPlugin = () => {
    if (rtlTextPluginRequested || typeof maplibregl.setRTLTextPlugin !== 'function') {
        return;
    }

    rtlTextPluginRequested = true;
    maplibregl.setRTLTextPlugin(RTL_TEXT_PLUGIN_URL, true);
};

export default function LocationMap({ latitude, longitude, address, locationStatus, locationError }: LocationMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const isProcessing = locationStatus === 'processing';
    const hasCoordinates = latitude != null && longitude != null;
    const isArabic = containsArabic(address) || containsArabic(locationError);
    const mapTextDirection = isArabic ? 'rtl' : 'ltr';
    const languageKey = isArabic ? 'ar' : 'en';
    const stateKey = isProcessing ? 'processing' : locationStatus === 'error' ? 'error' : 'idle';
    const message = locationMessages[stateKey][languageKey];

    useEffect(() => {
        if (!mapRef.current || hasCoordinates && !isProcessing) {
            return;
        }

        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
    }, [hasCoordinates, isProcessing]);

    useEffect(() => {
        if (!mapContainerRef.current || !hasCoordinates || isProcessing) return;

        ensureRtlTextPlugin();

        if (!mapRef.current) {
            const map = new maplibregl.Map({
                container: mapContainerRef.current,
                style: 'https://tiles.openfreemap.org/styles/liberty', // OpenFreeMap
                center: [longitude, latitude],
                zoom: 14,
                attributionControl: false,
            });

            // Add navigation controls (zoom in/out) without the compass for a cleaner look
            map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

            map.on('load', () => {
                setMapLoaded(true);
            });

            mapRef.current = map;
        }

        // Custom marker element matching our brand
        if (mapRef.current) {
            if (markerRef.current) {
                markerRef.current.setLngLat([longitude, latitude]);
                mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, essential: true });
            } else {
                const el = document.createElement('div');
                el.className = 'custom-map-marker';
                el.innerHTML = `
                    <div style="background: var(--gold); border-radius: 50%; padding: 8px; box-shadow: 0 4px 12px rgba(201,168,76,0.4); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: pointer; transition: transform 0.2s ease;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>
                `;

                // Add simple hover effect script
                el.onmouseenter = () => { el.firstElementChild!.setAttribute('style', el.firstElementChild!.getAttribute('style')! + ' transform: scale(1.1);'); };
                el.onmouseleave = () => { el.firstElementChild!.setAttribute('style', el.firstElementChild!.getAttribute('style')!.replace(' transform: scale(1.1);', '')); };

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([longitude, latitude]);
                
                if (address) {
                    marker.setPopup(
                        new maplibregl.Popup({ offset: 25, closeButton: false, className: 'custom-map-popup' })
                            .setHTML(`<div dir="${mapTextDirection}" lang="${isArabic ? 'ar' : 'en'}" style="padding: 4px; font-weight: 500; color: #222; font-family: var(--font-family-sans); text-align: ${isArabic ? 'right' : 'left'};">${escapeHtml(address)}</div>`)
                    );
                }
                
                marker.addTo(mapRef.current);
                markerRef.current = marker;
            }
        }
    }, [latitude, longitude, address, hasCoordinates, isProcessing, isArabic, mapTextDirection]);

    if (!hasCoordinates || isProcessing) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                dir={mapTextDirection}
                lang={languageKey}
                style={mapCardBaseStyle}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(201,168,76,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(59,130,246,0.14), transparent 26%), linear-gradient(180deg, rgba(10,22,40,0.92), rgba(7,16,30,0.96))' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 2 }}>
                    <div style={{ maxWidth: 380, width: '100%', borderRadius: 24, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(7,16,30,0.70)', backdropFilter: 'blur(18px)', boxShadow: '0 24px 64px rgba(0,0,0,0.42)', padding: 26, textAlign: isArabic ? 'right' : 'center', color: 'var(--white)', fontFamily: 'var(--font-family-sans)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', marginBottom: 18, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 0 6px rgba(201,168,76,0.16)' }} />
                            Map status
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'center', textAlign: isArabic ? 'right' : 'left' }}>
                            <div style={{ position: 'relative', width: 68, height: 68 }}>
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)', background: 'radial-gradient(circle, rgba(201,168,76,0.20), rgba(201,168,76,0.04) 58%, rgba(255,255,255,0.04) 59%, rgba(255,255,255,0.02) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--gold)', animation: 'mapSpin 1s linear infinite' }} />
                                <div style={{ position: 'absolute', inset: 22, borderRadius: '50%', background: 'rgba(201,168,76,0.18)', display: 'grid', placeItems: 'center' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z"></path>
                                        <circle cx="12" cy="10" r="2.2"></circle>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginBottom: 10 }}>
                                    {message.title}
                                </div>
                                <div style={{ color: 'rgba(226,232,240,0.76)', fontSize: 14, lineHeight: 1.7 }}>
                                    {message.body}
                                </div>
                            </div>
                        </div>
                        {locationError && locationStatus === 'error' && (
                            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 14, background: 'rgba(252,165,165,0.10)', border: '1px solid rgba(252,165,165,0.20)', color: '#fecaca', fontSize: 13, lineHeight: 1.6 }}>
                                {locationError}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
                            {['Resolve', 'Render', 'Pin'].map((label, index) => (
                                <div key={label} style={{ height: 10, borderRadius: 999, background: index === 1 ? 'linear-gradient(90deg, rgba(201,168,76,0.18), rgba(201,168,76,0.72), rgba(201,168,76,0.18))' : 'rgba(255,255,255,0.08)', animation: index === 1 ? 'mapPulse 1.4s ease-in-out infinite' : 'none' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            dir={mapTextDirection}
            lang={isArabic ? 'ar' : 'en'}
            style={mapCardBaseStyle}
        >
            <style>{`
                @keyframes mapSpin { 100% { transform: rotate(360deg); } }
                @keyframes mapPulse {
                    0%, 100% { transform: scaleX(0.9); opacity: 0.55; }
                    50% { transform: scaleX(1); opacity: 1; }
                }
                .custom-map-popup .maplibregl-popup-content {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                    padding: 8px 12px;
                    font-family: var(--font-family-sans);
                }
                .custom-map-popup .maplibregl-popup-tip {
                    border-top-color: #fff;
                }
                .custom-map-popup {
                    direction: ${mapTextDirection};
                }
            `}</style>
            <AnimatePresence>
                {!mapLoaded && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'linear-gradient(180deg, rgba(7,16,30,0.98), rgba(7,16,30,0.92))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24, textAlign: 'center', color: 'var(--white)' }}>
                            <div style={{ position: 'relative', width: 72, height: 72 }}>
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)', background: 'radial-gradient(circle, rgba(201,168,76,0.18), rgba(201,168,76,0.04) 58%, rgba(255,255,255,0.02) 100%)' }} />
                                <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: 'var(--gold)', animation: 'mapSpin 1s linear infinite' }} />
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', inset: 0, margin: 'auto' }}>
                                    <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11z"></path>
                                    <circle cx="12" cy="10" r="2.2"></circle>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{mapLoaded ? 'Map ready' : 'Loading map tiles'}</div>
                                <div style={{ color: 'rgba(226,232,240,0.72)', fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
                                    We are drawing the map and placing the marker. This usually takes only a moment.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </motion.div>
    );
}