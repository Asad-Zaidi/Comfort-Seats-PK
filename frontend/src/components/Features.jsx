import React from "react";
import {
    FiTruck,
    FiRefreshCw,
    FiShield,
    FiTool,
} from "react-icons/fi";

const features = [
    {
        icon: <FiTruck size={42} />,
        title: "Doorstep Delivery",
        description:
            "Fast and secure delivery to your doorstep across Pakistan.",
    },
    {
        icon: <FiRefreshCw size={42} />,
        title: "7 Days Return Policy",
        description:
            "Easy returns within 7 days for eligible products.",
    },
    {
        icon: <FiShield size={42} />,
        title: "1 Year Warranty",
        description:
            "Enjoy a one-year warranty for peace of mind.",
    },
    {
        icon: <FiTool size={42} />,
        title: "Assembly Assistance",
        description:
            "Our team helps you assemble your furniture with ease.",
    },
];

const Features = () => {
    return (
        <section className="bg-[#FAF9F6] my-16 py-12">
            <div className="px-32">
                <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-4 text-[#2D4A42]">
                                {item.icon}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="mt-2 max-w-[220px] text-sm leading-6 text-gray-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;