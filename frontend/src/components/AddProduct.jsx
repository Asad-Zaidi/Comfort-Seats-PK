import React from "react";
import ProductWizard from "./product/wizard/ProductWizard";

const AddProduct = ({ open = false, onClose = () => { }, onSubmit = null, initialData = null, isEdit = false }) => {
    return (
        <ProductWizard
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
            initialData={initialData}
            isEdit={isEdit}
        />
    );
};

export default AddProduct;