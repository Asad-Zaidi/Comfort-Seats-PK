import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ category, subcategory, productName, crumbs }) => {
    // Allow callers to pass a pre-built crumbs array (used by Products page).
    // Otherwise build from category/subcategory/productName (used by ProductDetail).
    const items = Array.isArray(crumbs)
        ? crumbs
        : (() => {
              const list = [
                  { name: "Home", to: "/" },
                  { name: "Products", to: "/products" },
              ];
              if (category) {
                  list.push({
                      name: category,
                      to: `/products?category=${encodeURIComponent(category)}`,
                  });
              }
              if (subcategory) {
                  list.push({
                      name: subcategory,
                      to: `/products?category=${encodeURIComponent(
                          category || ""
                      )}&subcategory=${encodeURIComponent(subcategory)}`,
                  });
              }
              if (productName) {
                  list.push({ name: productName });
              }
              return list;
          })();

    return (
        <>
            <nav
                className=" dark:border-gray-600 py-3 "
                aria-label="breadcrumb"
            >
                <ol className="flex flex-wrap items-center max-w-7xl mx-auto px-4 text-xs sm:text-sm">
                    {items.map((item, idx) => {
                        const isLast = idx === items.length - 1;
                        return (
                            <li key={idx} className="flex items-center">
                                {item.to && !isLast ? (
                                    <Link
                                        to={item.to}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <span
                                        className={
                                            isLast
                                                ? "text-gray-500 dark:text-gray-300 font-medium truncate max-w-xs"
                                                : "text-blue-600 dark:text-blue-400"
                                        }
                                    >
                                        {item.name}
                                    </span>
                                )}
                                {!isLast && (
                                    <span className="mx-1 text-gray-400 dark:text-gray-400">/</span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumb;
