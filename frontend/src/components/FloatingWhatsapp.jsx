import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import api from "../api/api";

// Convert number or URL to WhatsApp URL
const resolveWhatsappUrl = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `https://wa.me/${value.replace(/[^\d]/g, "")}`;
};

const FloatingWhatsapp = ({ product, productUrl }) => {
    const [whatsapp, setWhatsapp] = useState(null);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await api.get("/contact");
                if (res.data?.success && res.data.data?.whatsapp) {
                    setWhatsapp(res.data.data.whatsapp);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchContact();
    }, []);

    if (!whatsapp) return null;

    // Build greeting based on whether product details are provided
    const greeting = product
        ? `Hello! I'm interested in "${product.name}".\n\n📋 *Product Details:*\n• Name: ${product.name}\n• Price: Rs. ${product.price || "N/A"}\n• Link: ${productUrl || "N/A"}\n\nCould you please help me with pricing and availability?`
        : "Hello! I'm interested in your products. Could you please help me with pricing and availability?";

    const chatUrl = resolveWhatsappUrl(whatsapp) + `?text=${encodeURIComponent(greeting)}`;

    return (
        <div className="fixed bottom-6 right-5 z-50">
            <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 hover:w-44 items-center overflow-hidden rounded-full bg-[#1fc05a] text-white shadow-lg hover:shadow-2xl transition-all duration-300" >
                {/* Icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                    <FaWhatsapp size={28} />
                </div>

                {/* Text */}
                <span className="whitespace-nowrap text-[15px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Chat with us
                </span>
            </a>
        </div>
    );
};

export default FloatingWhatsapp;