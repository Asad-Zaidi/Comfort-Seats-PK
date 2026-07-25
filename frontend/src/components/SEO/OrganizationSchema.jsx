import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * Organization Schema Component
 * Adds Organization structured data to help search engines understand your business
 * Place this in your Home or App component
 */
const OrganizationSchema = () => {
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Digital Product Store",
        "description": "Your product marketplace for digital services and software",
        "url": `${window.location.origin}`,
        "logo": `${window.location.origin}/logo.png`,
        "sameAs": [
            "https://twitter.com/yourhandle",
            "https://www.facebook.com/yourpage",
            "https://www.linkedin.com/company/yourcompany",
            "https://www.instagram.com/yourhandle"
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Village Kamas",
            "addressLocality": "Lahore",
            "addressRegion": "Punjab",
            "postalCode": "55150",
            "addressCountry": "PK"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@yourdomain.com",
            "telephone": "+92-308-4401410"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(organizationData)}
            </script>
        </Helmet>
    );
};

export default OrganizationSchema;
