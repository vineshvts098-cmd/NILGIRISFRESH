import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
}

export default function SEO({
    title = 'NilgirisFresh - Premium Nilgiri Tea & Spices',
    description = 'Buy authentic Nilgiri tea and premium spices directly from Gudalur estates. Fresh, pure, farmer-direct. Pan-India delivery.',
    name = 'NilgirisFresh',
    type = 'website',
    image = 'https://nilgirisfresh.com/logo.jpeg',
    url = 'https://nilgirisfresh.com',
}: SEOProps) {
    const siteTitle = title === 'NilgirisFresh - Premium Nilgiri Tea & Spices'
        ? title
        : `${title} | NilgirisFresh`;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "NilgirisFresh",
        "image": image,
        "description": description,
        "telephone": "+91-63698-12070",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Gudalur",
            "addressLocality": "Nilgiris District",
            "addressRegion": "Tamil Nadu",
            "postalCode": "643212",
            "addressCountry": "IN"
        },
        "url": url,
        "priceRange": "₹₹",
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "09:00",
            "closes": "21:00"
        }
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@NilgirisFresh" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
