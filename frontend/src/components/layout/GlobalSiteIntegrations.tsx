import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

type TrackingSettings = {
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    google_search_console_code?: string;
};

type CustomScript = {
    id: number;
    location: 'header' | 'body' | 'footer';
    content: string;
};

type InjectedNode = {
    node: Node;
    parent: ParentNode;
};

function appendHtmlSnippet(html: string, target: ParentNode, marker: string) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const nodes: InjectedNode[] = [];

    Array.from(temp.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            (child as Element).setAttribute('data-site-integration', marker);
        }
        target.appendChild(child);
        nodes.push({ node: child, parent: target });
    });

    return nodes;
}

function prependHtmlSnippet(html: string, target: ParentNode, marker: string) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const nodes: InjectedNode[] = [];
    const newNodes: Node[] = [];

    Array.from(temp.childNodes).forEach((child) => {
        const cloned = child.cloneNode(true);
        if (cloned.nodeType === Node.ELEMENT_NODE) {
            (cloned as Element).setAttribute('data-site-integration', marker);
        }
        newNodes.push(cloned);
    });

    const firstChild = target.firstChild;
    newNodes.forEach((node) => {
        target.insertBefore(node, firstChild);
        nodes.push({ node, parent: target });
    });

    return nodes;
}

function createScriptNode(content: string, marker: string, src?: string) {
    const script = document.createElement('script');
    script.setAttribute('data-site-integration', marker);
    if (src) {
        script.src = src;
        script.async = true;
    } else {
        script.text = content;
    }
    return script;
}

export default function GlobalSiteIntegrations() {
    const injectedNodes = useRef<InjectedNode[]>([]);
    const { data: trackingData } = useQuery<TrackingSettings>({
        queryKey: ['tracking-settings'],
        queryFn: () => client.get('/tracking-settings').then((r) => r.data),
        staleTime: 60_000,
    });

    const { data: scriptsData } = useQuery<CustomScript[]>({
        queryKey: ['custom-scripts'],
        queryFn: () => client.get('/custom-scripts').then((r) => r.data),
        staleTime: 60_000,
    });

    const normalized = useMemo(() => ({
        analyticsId: trackingData?.google_analytics_id?.trim() ?? '',
        tagManagerId: trackingData?.google_tag_manager_id?.trim() ?? '',
        searchConsoleCode: trackingData?.google_search_console_code?.trim() ?? '',
        headerScripts: scriptsData?.filter((s) => s.location === 'header').map((s) => s.content).join('\n') ?? '',
        bodyScripts: scriptsData?.filter((s) => s.location === 'body').map((s) => s.content).join('\n') ?? '',
        footerScripts: scriptsData?.filter((s) => s.location === 'footer').map((s) => s.content).join('\n') ?? '',
    }), [trackingData, scriptsData]);

    useEffect(() => {
        const head = document.head;
        const body = document.body;
        if (!head || !body) return;

        const cleanup = () => {
            injectedNodes.current.forEach(({ node, parent }) => {
                if (parent.contains(node)) {
                    parent.removeChild(node);
                }
            });
            injectedNodes.current = [];
        };

        cleanup();

        if (normalized.searchConsoleCode) {
            const meta = document.createElement('meta');
            meta.name = 'google-site-verification';
            meta.content = normalized.searchConsoleCode;
            meta.setAttribute('data-site-integration', 'search-console');
            head.appendChild(meta);
            injectedNodes.current.push({ node: meta, parent: head });
        }

        if (normalized.analyticsId) {
            const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(normalized.analyticsId)}`;
            const analyticsLoader = createScriptNode('', 'google-analytics-loader', src);
            const analyticsConfig = createScriptNode(
                [
                    `window.dataLayer = window.dataLayer || [];`,
                    `function gtag(){dataLayer.push(arguments);}`,
                    `gtag('js', new Date());`,
                    `gtag('config', '${normalized.analyticsId}');`,
                ].join('\n'),
                'google-analytics-config',
            );
            head.appendChild(analyticsLoader);
            head.appendChild(analyticsConfig);
            injectedNodes.current.push({ node: analyticsLoader, parent: head }, { node: analyticsConfig, parent: head });
        }

        if (normalized.tagManagerId) {
            const tagManagerScript = createScriptNode(
                [
                    `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});`,
                    `var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';`,
                    `j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;`,
                    `f.parentNode.insertBefore(j,f);` ,
                    `})(window,document,'script','dataLayer','${normalized.tagManagerId}');`,
                ].join(' '),
                'google-tag-manager-head',
            );
            const noscript = document.createElement('noscript');
            noscript.setAttribute('data-site-integration', 'google-tag-manager-body');
            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(normalized.tagManagerId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            head.appendChild(tagManagerScript);
            body.insertBefore(noscript, body.firstChild);
            injectedNodes.current.push({ node: tagManagerScript, parent: head }, { node: noscript, parent: body });
        }

        if (normalized.headerScripts) {
            injectedNodes.current.push(...appendHtmlSnippet(normalized.headerScripts, head, 'custom-header'));
        }

        if (normalized.bodyScripts) {
            injectedNodes.current.push(...prependHtmlSnippet(normalized.bodyScripts, body, 'custom-body'));
        }

        if (normalized.footerScripts) {
            injectedNodes.current.push(...appendHtmlSnippet(normalized.footerScripts, body, 'custom-footer'));
        }

        return cleanup;
    }, [normalized]);

    return null;
}