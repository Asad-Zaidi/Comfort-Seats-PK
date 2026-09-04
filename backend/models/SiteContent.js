const mongoose = require('mongoose');

const BusinessHourSchema = new mongoose.Schema({
    label: {
        type: String,
        trim: true,
        default: ''
    },
    value: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    icon: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const ValueSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    icon: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const AboutCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    icon: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const AboutStatSchema = new mongoose.Schema({
    label: {
        type: String,
        trim: true,
        default: ''
    },
    value: {
        type: String,
        trim: true,
        default: '1995'
    },
    icon: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const ColorSchema = new mongoose.Schema({
    primary: { type: String, default: '#2F6FED' },
    primaryHover: { type: String, default: '#1d4ed8' },
    secondary: { type: String, default: '#F5A524' },
    secondaryHover: { type: String, default: '#d48c1a' },
    accent: { type: String, default: '#f97316' },
    textPrimary: { type: String, default: '#12131A' },
    textSecondary: { type: String, default: '#6b7280' },
    textLight: { type: String, default: '#9ca3af' },
    background: { type: String, default: '#ffffff' },
    backgroundSecondary: { type: String, default: '#f8fafc' },
    backgroundTertiary: { type: String, default: '#FAF9F6' },
    border: { type: String, default: '#e5e7eb' },
    success: { type: String, default: '#10B981' },
    error: { type: String, default: '#E5484D' },
    headerBg: { type: String, default: '#ffffff' },
    headerText: { type: String, default: '#1f2937' },
    footerBg: { type: String, default: '#12131A' },
    footerText: { type: String, default: '#ffffff' },
    buttonText: { type: String, default: '#ffffff' },
    cardBg: { type: String, default: '#ffffff' },
    announcementBg: { type: String, default: '#12131A' },
    announcementText: { type: String, default: '#ffffff' },
}, { _id: false });

const SiteContentSchema = new mongoose.Schema({
    homeBanner: {
        eyebrow: {
            type: String,
            trim: true,
            default: 'Trusted'
        },
        title: {
            type: String,
            trim: true,
            default: 'Comfort, Built to Last.'
        },
        description: {
            type: String,
            trim: true,
            default: 'Premium Office Chairs, Gaming Chairs, Stools, Chair Accessories, Furniture etc.'
        },
        primaryButtonText: {
            type: String,
            trim: true,
            default: 'Explore Our Products'
        },
        primaryButtonLink: {
            type: String,
            trim: true,
            default: '/products'
        },
        secondaryButtonText: {
            type: String,
            trim: true,
            default: 'Our Story'
        },
        secondaryButtonLink: {
            type: String,
            trim: true,
            default: '/about'
        },
        imageUrl: {
            type: String,
            trim: true,
            default: ''
        },
        desktopImage: {
            type: String,
            trim: true,
            default: ''
        },
        mobileImage: {
            type: String,
            trim: true,
            default: ''
        },
        imageAlt: {
            type: String,
            trim: true,
            default: 'Premium Office Chair'
        },
        statValue: {
            type: String,
            trim: true,
            default: '30+'
        },
        statLabel: {
            type: String,
            trim: true,
            default: ''
        },
        keywords: {
            type: String,
            trim: true,
            default: 'office chairs, gaming chairs, stools, chair accessories, furniture, Pakistan, Ergonomic Chairs'
        }
    },
    categories: {
        type: [CategorySchema],
        default: () => [
            { name: 'Office', icon: 'FiBriefcase' },
            { name: 'Gaming', icon: 'FiZap' },
            { name: 'Dining', icon: 'FiHome' },
            { name: 'Luxury', icon: 'FiAward' },
            { name: 'Outdoor', icon: 'FiSun' }
        ]
    },
    whyChooseUs: {
        type: [ValueSchema],
        default: () => [
            { icon: 'FiFeather', title: 'Quality Craftsmanship', desc: 'Every piece built with care and quality materials.' },
            { icon: 'FiDollarSign', title: 'Affordable Pricing', desc: 'Premium comfort without the premium price tag.' },
            { icon: 'FiShield', title: 'Built to Last', desc: 'Durability that holds up to everyday use.' },
            { icon: 'FiCheckCircle', title: '30+ Years Trusted', desc: 'A legacy of customer satisfaction since 1995.' }
        ]
    },
    businessHours: {
        type: [BusinessHourSchema],
        default: () => [
            { label: 'Mon - Sat', value: '10:00 AM - 8:00 PM' }
        ]
    },
    quoteSection: {
        label: {
            type: String,
            trim: true,
            default: 'Designed For Modern Workspaces'
        },
        firstSentence: {
            type: String,
            trim: true,
            default: 'Where Comfort Meets '
        },
        rotatingWords: {
            type: [String],
            default: () => ['Productivity', 'Comfort', 'Ergonomics', 'Luxury', 'Quality', 'Performance', 'Style', 'Excellence']
        },
        description: {
            type: String,
            trim: true,
            default: 'Elevate your workspace with furniture crafted to inspire creativity, improve posture, and redefine everyday comfort. Experience the perfect blend of premium design and lasting functionality.'
        }
    },
    aboutUs: {
        heroEyebrow: {
            type: String,
            trim: true,
            default: 'About Comfort Seats PK'
        },
        heroTitle: {
            type: String,
            trim: true,
            default: 'Crafting Comfort'
        },
        heroDescription: {
            type: String,
            trim: true,
            default: 'Formerly known as ComfortSeats is a trusted furniture manufacturer built on years of craftsmanship, reliability, and customer satisfaction - proudly based in Lahore, Pakistan.'
        },
        heroImageUrl: {
            type: String,
            trim: true,
            default: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1000'
        },
        heroImageAlt: {
            type: String,
            trim: true,
            default: 'Comfort Seats PK - Modern Office Chair and Furniture Manufacturer in Lahore, Pakistan'
        },
        stats: {
            type: [AboutStatSchema],
            default: () => [
                { icon: 'FiCalendar', label: 'Established', value: '1995' },
                { icon: 'FiAward', label: 'Years of Legacy', value: '25+' },
                { icon: 'FiMapPin', label: 'Based In', value: 'Lahore, PK' },
                { icon: 'FiGrid', label: 'Product Categories', value: '6+' }
            ]
        },
        storyTitle: {
            type: String,
            trim: true,
            default: 'Our Story'
        },
        storyParagraph1: {
            type: String,
            trim: true,
            default: 'Comfort Seats PK is a trusted name across Lahore and beyond.'
        },
        storyParagraph2: {
            type: String,
            trim: true,
            default: 'Today, as Comfort Seats PK, we carry that same legacy forward - combining traditional craftsmanship with modern design to serve a new generation of homes and workplaces.'
        },
        storyImageUrl: {
            type: String,
            trim: true,
            default: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1000'
        },
        storyImageAlt: {
            type: String,
            trim: true,
            default: 'Furniture and Chairs at Comfort Seats PK'
        },
        categoriesTitle: {
            type: String,
            trim: true,
            default: 'What We Make'
        },
        categoriesDescription: {
            type: String,
            trim: true,
            default: 'A full range of seating and furniture, manufactured with quality materials for comfort, durability, and modern style.'
        },
        categories: {
            type: [AboutCategorySchema],
            default: () => [
                { icon: 'FiZap', name: 'Gaming Chairs', desc: 'Ergonomic seating built for long sessions and serious comfort.' },
                { icon: 'FiBriefcase', name: 'Office Chairs', desc: 'Everyday support designed for productivity and posture.' },
                { icon: 'FiAward', name: 'Manager Chairs', desc: 'A step up in style and support for growing responsibilities.' },
                { icon: 'FiTrendingUp', name: 'Executive Chairs', desc: 'Premium finishes and comfort for leadership spaces.' },
                { icon: 'FiHome', name: 'Sofas & Sofa Sets', desc: 'Living room seating crafted for durability and style.' },
                { icon: 'FiGrid', name: 'Office Furniture', desc: 'Complete furnishing solutions for modern workplaces.' }
            ]
        },
        missionEyebrow: {
            type: String,
            trim: true,
            default: 'Our Mission'
        },
        missionTitle: {
            type: String,
            trim: true,
            default: '"To provide high-quality furniture at affordable prices - without compromising on comfort or craftsmanship."'
        },
        missionDescription: {
            type: String,
            trim: true,
            default: 'We believe every customer deserves furniture that offers lasting value, enhances productivity, and creates a better home or workplace experience.'
        },
        valuesTitle: {
            type: String,
            trim: true,
            default: 'Why Choose Us'
        },
        values: {
            type: [ValueSchema],
            default: () => [
                { icon: 'FiFeather', title: 'Quality Craftsmanship', desc: 'Every piece is built with attention to detail and quality materials.' },
                { icon: 'FiDollarSign', title: 'Affordable Pricing', desc: 'Premium furniture that doesn\'t come with a premium price tag.' },
                { icon: 'FiShield', title: 'Built to Last', desc: 'Durability that holds up to daily use, year after year.' },
                { icon: 'FiCheckCircle', title: 'Customer Satisfaction', desc: 'Three decades of relationships built on trust and reliability.' }
            ]
        },
        ctaTitle: {
            type: String,
            trim: true,
            default: 'Ready to furnish your space?'
        },
        ctaDescription: {
            type: String,
            trim: true,
            default: 'Browse our full range of chairs, sofas, and office furniture.'
        },
        ctaButtonText: {
            type: String,
            trim: true,
            default: 'Shop Now'
        },
        ctaButtonLink: {
            type: String,
            trim: true,
            default: '/products'
        }
    },
    siteName: {
        type: String,
        trim: true,
        default: ''
    },
    siteUrl: {
        type: String,
        trim: true,
        default: ''
    },
    siteTitle: {
        type: String,
        trim: true,
        default: ''
    },
    keywords: {
        type: String,
        trim: true,
        default: ''
    },
    logoUrl: {
        type: String,
        trim: true,
        default: ''
    },
    faviconUrl: {
        type: String,
        trim: true,
        default: ''
    },
    whatsappNumber: {
        type: String,
        trim: true,
        default: ''
    },
    colors: {
        type: ColorSchema,
        default: () => ({})
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    privacyPolicy: {
        type: String,
        trim: true,
        default: 'At ComfortSeats, we respect your privacy and are committed to protecting your personal information. When you place an order or contact us, we may collect your name, email address, phone number, and delivery address to process your order and provide customer support. Your information is kept secure and is never sold or shared with others except when necessary to complete your order. We use your information only to improve our services and ensure a smooth shopping experience. By using our website, you agree to this Privacy Policy.'
    },
    returnPolicy: {
        type: String,
        trim: true,
        default: 'We accept returns within 7 days of delivery for most products. Items must be in their original condition, unused, and in their original packaging. Custom-made or clearance items are non-returnable unless defective. To initiate a return, contact our customer support team. Once we receive and inspect the returned item, we will process your refund within 7-10 business days. Shipping charges are non-refundable unless the return is due to our error.'
    },
    warrantyPolicy: {
        type: String,
        trim: true,
        default: 'We stand behind the quality of our products. All furniture items come with a warranty against manufacturing defects in materials and workmanship. The warranty period varies by product category - please contact our support team for specific warranty details. This warranty does not cover normal wear and tear, misuse, or damage caused by improper assembly or unauthorized modifications.'
    },
    delivery: {
        fastDeliveryCharge: {
            type: Number,
            default: 200
        },
        codOnlinePaymentMessage: {
            type: String,
            trim: true,
            default: 'You have to pay Rs. {amount} online in advance for Cash on Delivery.'
        }
    }
});

SiteContentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

SiteContentSchema.statics.getSingleton = async function () {
    let siteContent = await this.findOne();
    if (!siteContent) {
        siteContent = await this.create({});
    }
    return siteContent;
};

module.exports = mongoose.model('SiteContent', SiteContentSchema);