import React from "react";
import { Helmet } from "react-helmet-async";

const WebSiteSchema = () => {
    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ServiceHub - Digital Tools & Subscriptions",
        "alternateName": "ServiceHub",
        "url": `${window.location.origin}`,
        "description": "Discover powerful digital tools and flexible subscription plans. Simplify your workflow and boost productivity.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${window.location.origin}/products?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(websiteData)}
            </script>
        </Helmet>
    );
};

export default WebSiteSchema;
